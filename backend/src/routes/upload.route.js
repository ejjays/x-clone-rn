import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getUploadSignature, getImageKitAuthParams, migratePostMediaToImageKit } from "../controllers/upload.controller.js";

const router = express.Router();

router.post("/signature", protectRoute, getUploadSignature);
router.get("/imagekit/auth", protectRoute, getImageKitAuthParams);
router.post("/imagekit/migrate", protectRoute, migratePostMediaToImageKit);

export default router;

