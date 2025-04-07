import express, { Router } from 'express';
import { 
  uploadDocument, 
  getUserDocuments, 
  getSingleDocument, 
  deleteDocument,
  processDocumentSummary,
  processDocumentQa,
  processDocumentQuiz,
  getDocumentQuiz
} from '../controllers/documentController';
import authMiddleware from '../middleware/authMiddleware';
import fs from 'fs';
import path from 'path';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory at:', uploadsDir);
}

const router: Router = express.Router();

// Upload document
router.post('/upload', authMiddleware, uploadDocument);

// Get all documents for the logged-in user
router.get('/', authMiddleware, getUserDocuments);

// Get a single document by ID
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    await getSingleDocument(req, res);
    return next();
  } catch (error) {
    return next(error);
  }
});

// Get quiz details for a specific document
router.get('/:id/quiz', authMiddleware, async (req, res, next) => {
  try {
    await getDocumentQuiz(req, res);
    return next();
  } catch (error) {
    return next(error);
  }
});

// Process document and generate summary
router.post('/:id/process/summary', authMiddleware, async (req, res, next) => {
  try {
    await processDocumentSummary(req, res);
    return next();
  } catch (error) {
    return next(error);
  }
});

// Process document and generate Q&A
router.post('/:id/process/qa', authMiddleware, async (req, res, next) => {
  try {
    await processDocumentQa(req, res);
    return next();
  } catch (error) {
    return next(error);
  }
});

// Process document and generate quiz
router.post('/:id/process/quiz', authMiddleware, async (req, res, next) => {
  try {
    await processDocumentQuiz(req, res);
    return next();
  } catch (error) {
    return next(error);
  }
});

// Delete a document by ID
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    await deleteDocument(req, res);
    return next();
  } catch (error) {
    return next(error);
  }
});

export default router;