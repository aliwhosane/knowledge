import express, { Router } from 'express';
import { handleChatMessage, getChatHistory } from '../controllers/chatController';
import authMiddleware from '../middleware/authMiddleware';
import { chatValidationRules, validateRequest } from '../middleware/validationMiddleware';

const router: Router = express.Router();

// Handle chat messages
router.post('/', authMiddleware, chatValidationRules, validateRequest, handleChatMessage);

// Get chat history
router.get('/history', authMiddleware, getChatHistory);

export default router;