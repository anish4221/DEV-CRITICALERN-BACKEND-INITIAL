import express from "express";
import { authenticate } from "../middleware/auth.js";
import { isArticleOwner } from "../middleware/articleOwner.js";
import {
  createArticle,
  saveAsDraft,
  publishArticle,
  getArticleBySlug,
  getLatestCoverArticles,
  getArticle,
} from "../controller/articleController.js";

const router = express.Router();

// 🔹 Create article (default = draft)
router.post("/", authenticate, createArticle);

// 🔹 Save as draft
router.put(
  "/:articleId/draft",
  authenticate,
  isArticleOwner,
  saveAsDraft
);

// 🔹 Publish article
router.put(
  "/:articleId/publish",
  authenticate,
  isArticleOwner,
  publishArticle
);

router.get("/authArticle",authenticate,getArticle);
// CoverArticle
router.get("/coverArticle",getLatestCoverArticles );

// 🔹 Get article by slug (public)
router.get("/:slug", getArticleBySlug);


export default router;
