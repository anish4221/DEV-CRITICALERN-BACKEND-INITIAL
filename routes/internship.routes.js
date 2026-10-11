import express from "express";
import { authenticate } from "../middleware/auth.js";
import { addInternshipLink, getInternshipLinks } from "../controller/internshipController.js";

const router = express.Router();

router.post("/internship-links", authenticate, addInternshipLink);
router.get("/internship-links", authenticate, getInternshipLinks);
export default router;