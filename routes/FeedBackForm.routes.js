import express from "express";
import {authenticate} from "../middleware/authenticate.js";
import {updateFormStatus} from "../controller/FeedbackForm/showstatus.js";
const router = express.Router();

router.put("/feedback/status", authenticate, updateFormStatus);
export default router;