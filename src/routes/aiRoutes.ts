import express, { Router } from 'express';
import { getAiChatResponse } from '../controllers/aiController';
import authMiddleware from '../middleware/authMiddleware';

const router: Router = express.Router();

// Get AI chat response
router.post('/chat', authMiddleware, getAiChatResponse);

export default router;