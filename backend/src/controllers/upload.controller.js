import crypto from "crypto";
import axios from "axios";
import { ENV } from "../config/env.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { getAuth } from "@clerk/express";

export const getUploadSignature = async (req, res) => {
  try {
    const { folder, eager, invalidate } = req.body || {};
    const timestamp = Math.floor(Date.now() / 1000);

    const paramsToSign = {
      timestamp,
      folder,
      eager,
      invalidate,
    };

    // Build signature string (exclude undefined)
    const toSign = Object.keys(paramsToSign)
      .filter((k) => paramsToSign[k] !== undefined && paramsToSign[k] !== null && paramsToSign[k] !== "")
      .sort()
      .map((k) => `${k}=${paramsToSign[k]}`)
      .join("&");

    const signature = crypto
      .createHash("sha1")
      .update(toSign + ENV.CLOUDINARY_API_SECRET)
      .digest("hex");

    res.json({
      timestamp,
      signature,
      apiKey: ENV.CLOUDINARY_API_KEY,
      cloudName: ENV.CLOUDINARY_CLOUD_NAME,
    });
  } catch (e) {
    res.status(500).json({ error: "Failed to create signature" });
  }
};

export const getImageKitAuthParams = async (_req, res) => {
  try {
    if (!ENV.IMAGEKIT_PRIVATE_KEY || !ENV.IMAGEKIT_PUBLIC_KEY) {
      return res.status(500).json({ error: "ImageKit keys are not configured" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expire = Math.floor(Date.now() / 1000) + 60 * 10; // 10 minutes
    const signature = crypto
      .createHmac("sha1", ENV.IMAGEKIT_PRIVATE_KEY)
      .update(token + expire)
      .digest("hex");

    res.json({
      token,
      expire,
      signature,
      publicKey: ENV.IMAGEKIT_PUBLIC_KEY,
      urlEndpoint: ENV.IMAGEKIT_URL_ENDPOINT || null,
    });
  } catch (e) {
    res.status(500).json({ error: "Failed to generate ImageKit auth params" });
  }
};

export const migratePostMediaToImageKit = async (req, res) => {
  try {
    const { userId } = getAuth(req);
    const user = await User.findOne({ clerkId: userId });
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: "Admin privileges required" });
    }

    if (!ENV.IMAGEKIT_PRIVATE_KEY || !ENV.IMAGEKIT_PUBLIC_KEY) {
      return res.status(500).json({ error: "ImageKit keys are not configured" });
    }

    const limit = Math.min(Math.max(parseInt(req.body?.limit || "20", 10), 1), 200);
    const dryRun = Boolean(req.body?.dryRun);

    const cloudinaryHost = "res.cloudinary.com";

    const candidates = await Post.find({
      $or: [
        { image: { $regex: cloudinaryHost } },
        { video: { $regex: cloudinaryHost } },
      ],
    })
      .sort({ createdAt: 1 })
      .limit(limit);

    const authHeader = "Basic " + Buffer.from(`${ENV.IMAGEKIT_PRIVATE_KEY}:`).toString("base64");

    const results = [];
    for (const post of candidates) {
      const updates = {};
      // Helper to upload a remote URL to ImageKit
      const uploadRemote = async (remoteUrl, type) => {
        const form = new URLSearchParams();
        form.append("file", remoteUrl);
        form.append("fileName", `${type}_post_${post._id}_${Date.now()}`);
        form.append("folder", "app_uploads");
        form.append("useUniqueFileName", "true");
        const { data } = await axios.post(
          "https://upload.imagekit.io/api/v1/files/upload",
          form,
          {
            headers: {
              Authorization: authHeader,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            timeout: 60000,
          },
        );
        return data?.url || data?.thumbnailUrl || null;
      };

      let newImageUrl = null;
      let newVideoUrl = null;
      try {
        if (post.image && String(post.image).includes(cloudinaryHost)) {
          if (!dryRun) newImageUrl = await uploadRemote(post.image, "image");
        }
      } catch (e) {}
      try {
        if (post.video && String(post.video).includes(cloudinaryHost)) {
          if (!dryRun) newVideoUrl = await uploadRemote(post.video, "video");
        }
      } catch (e) {}

      if (newImageUrl) updates.image = newImageUrl;
      if (newVideoUrl) updates.video = newVideoUrl;

      if (!dryRun && (updates.image || updates.video)) {
        await Post.findByIdAndUpdate(post._id, { $set: updates });
      }

      results.push({
        postId: String(post._id),
        from: { image: post.image || null, video: post.video || null },
        to: { image: newImageUrl || null, video: newVideoUrl || null },
        updated: Boolean(!dryRun && (newImageUrl || newVideoUrl)),
      });
    }

    res.json({
      count: results.length,
      dryRun,
      results,
    });
  } catch (e) {
    res.status(500).json({ error: "Migration failed", details: e?.message });
  }
};

