import express, { Router } from 'express';
import { logSearch } from '../controllers/searchLogController';
import authMiddleware from '../middleware/authMiddleware';

const router: Router = express.Router();

// Log search query
router.post('/search', authMiddleware, logSearch);

export default router;