import express, { Router } from 'express';
import { logSearch } from '../controllers/searchLogController';
import authMiddleware from '../middleware/authMiddleware';

const router: Router = express.Router();

// Log search query
router.post('/search', authMiddleware, async (req, res, next) => {
  try {
    await logSearch(req, res);
    next();
  } catch (error) {
    next(error);
  }
});

export default router;