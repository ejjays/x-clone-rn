import crypto from "crypto";
import { ENV } from "../config/env.js";

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

