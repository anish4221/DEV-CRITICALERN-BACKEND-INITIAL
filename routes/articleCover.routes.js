import express from "express";
import { authenticate } from "../middleware/auth.js";
import { isArticleOwner } from "../middleware/articleOwner.js";
import { uploadCoverImage } from "../controller/articleCoverController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// 🔹 Upload / update cover image
router.post(
  "/:articleId/cover",
  authenticate,
  isArticleOwner,
  upload.single("cover"),
  uploadCoverImage
);

export default router;
