import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getUploadSignature, getImageKitAuthParams } from "../controllers/upload.controller.js";

const router = express.Router();

router.post("/signature", protectRoute, getUploadSignature);
router.get("/imagekit/auth", protectRoute, getImageKitAuthParams);

export default router;

