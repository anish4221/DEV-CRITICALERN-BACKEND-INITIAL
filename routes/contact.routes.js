import express from "express";
import { SaveContactUs } from "../controller/Contactus/contactUsController.js";
 const router = express.Router();

 router.post("/contact",SaveContactUs);

 export default router;



