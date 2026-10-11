import express from 'express';
import { postVisitCount, getVisitCount } from '../controller/VisitCount/visitCount.js';

const router = express.Router();

router.get('/getVisitorCount', getVisitCount);
router.post('/postVisitorCount', postVisitCount);

export default router;