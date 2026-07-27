import express from "express";
import { uploadImage } from "../controllers/uploadController.js";
import { AuthMiddleware } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post(
    "/upload",
    AuthMiddleware,
    upload.single("image"),
    uploadImage
);

export default router;