import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getUploadSignature } from "../controllers/upload.controller.js";

const router = express.Router();

router.post("/signature", protectRoute, getUploadSignature);

export default router;

