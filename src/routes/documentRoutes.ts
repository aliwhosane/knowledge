import express, { Router } from 'express';
import { 
  uploadDocument, 
  getUserDocuments, 
  getSingleDocument, 
  deleteDocument,
  processDocumentSummary,
  processDocumentQa,
  processDocumentQuiz
} from '../controllers/documentController';
import authMiddleware from '../middleware/authMiddleware';

const router: Router = express.Router();

// Upload document
router.post('/upload', authMiddleware, uploadDocument);

// Get all documents for the logged-in user
router.get('/', authMiddleware, getUserDocuments);

// Get a single document by ID
router.get('/:id', authMiddleware, getSingleDocument);

// Process document and generate summary
router.post('/:id/process/summary', authMiddleware, processDocumentSummary);

// Process document and generate Q&A
router.post('/:id/process/qa', authMiddleware, processDocumentQa);

// Process document and generate quiz
router.post('/:id/process/quiz', authMiddleware, processDocumentQuiz);

// Delete a document by ID
router.delete('/:id', authMiddleware, deleteDocument);

export default router;