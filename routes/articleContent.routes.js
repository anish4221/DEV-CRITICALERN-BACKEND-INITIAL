import express from "express";
import { authenticate } from "../middleware/auth.js";
import { isArticleOwner } from "../middleware/articleOwner.js";
import { saveContent } from "../controller/articleContentController.js";
import { getContent } from "../controller/articleContentController.js";

const router = express.Router();

// 🔹 Save editor JSON content
router.put(
  "/:articleId/content",
  authenticate,
  isArticleOwner,
  saveContent
);

router.get(
  "/:articleId/getcontent",
  authenticate,
  isArticleOwner,
  getContent
);

export default router;
