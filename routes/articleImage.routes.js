import express from "express";
import { authenticate } from "../middleware/auth.js";
import { isArticleOwner } from "../middleware/articleOwner.js";
import { uploadEditorImage } from "../controller/articleImageController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// 🔹 Upload editor image
router.post(
  "/:articleId/images",
  authenticate,
  isArticleOwner,
  upload.array("images", 10),
  uploadEditorImage
);

export default router;
