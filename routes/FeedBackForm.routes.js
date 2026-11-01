import express from "express";
import { authenticate } from "../middleware/auth.js";
import {updateFormStatus, getFormStatus} from "../controller/FeedbackForm/showstatus.js";
import submitFeedback from "../controller/FeedbackForm/formstore.js";
import exportFeedbackToExcel from "../controller/FeedbackForm/getData.js";
import {
  getFormQuestions,
  createQuestionGroup,
  addQuestionToGroup,
  setupCompleteFormQuestions,
  updateQuestionGroup,
  deleteQuestion,
  deleteQuestionGroup
} from "../controller/FeedbackForm/FormQuestion.js";

const router = express.Router();

// Status routes
router.put("/feedback", authenticate, updateFormStatus);
router.get("/feedback/status", getFormStatus);

// Student form submission
router.post("/feedback/submit", submitFeedback);

// Export Feedback to Excel (Admin only)
router.get("/feedback/export", authenticate, exportFeedbackToExcel);
router.post("/feedback/export", authenticate, exportFeedbackToExcel);



// Question dynamic routes
router.get("/feedback/questions", getFormQuestions); // Public (for students to load form)
router.post("/feedback/questions/bulk", authenticate, setupCompleteFormQuestions); // Admin: Setup complete template
router.post("/feedback/groups", authenticate, createQuestionGroup); // Admin: Create single group
router.put("/feedback/groups/:id", authenticate, updateQuestionGroup); // Admin: Update group (e.g. toggle isRequired/showComments)
router.post("/feedback/groups/:groupId/questions", authenticate, addQuestionToGroup); // Admin: Add question to group
router.delete("/feedback/questions/:id", authenticate, deleteQuestion); // Admin: Delete question
router.delete("/feedback/groups/:id", authenticate, deleteQuestionGroup); // Admin: Delete group (and cascade delete questions)

export default router;