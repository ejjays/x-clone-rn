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

