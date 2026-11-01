import express from "express";
import { authenticate } from "../middleware/auth.js";
import {addOpportunityLink, getOpportunities} from "../controller/Internship/LinksAdditions.js";

const router = express.Router();

router.post("/internship-links", authenticate, addOpportunityLink);
router.get("/getinternship-links", getOpportunities);
export default router;