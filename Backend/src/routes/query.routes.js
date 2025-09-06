import { Router } from 'express';
import { askQuestion } from '../controller/query.controller.js';

const router = Router();

router.post('/ask', askQuestion);

export default router;
