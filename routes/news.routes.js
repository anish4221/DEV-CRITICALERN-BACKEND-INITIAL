import express from "express";
import { authenticate } from "../middleware/auth.js";
import { isNewsOwner } from "../middleware/newsOwner.js";
import { createNews, createNewsImage } from "../controller/ShortNews/newsController.js";
import upload from "../middleware/upload.js";

const router = express.Router();
// Create news article
router.post("/create", authenticate, createNews);
// Add image to news article
router.post("/:newsId/image", authenticate, isNewsOwner, upload.single("cover"), createNewsImage);
export default router;