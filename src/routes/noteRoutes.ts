import express, { Router } from 'express';
import { createNote, getNotesForDocument, updateNote, deleteNote } from '../controllers/noteController';
import authMiddleware from '../middleware/authMiddleware';

const router: Router = express.Router();

// Create a new note
router.post('/', authMiddleware, createNote);

// Get all notes for a specific document
router.get('/document/:documentId', authMiddleware, getNotesForDocument);
// router.get('/document/:documentId', authMiddleware, async (req, res, next) => {
//     try {
//         await getNotesForDocument(req, res);
//     } catch (error) {
//         next(error);
//     }
// });

// Update a note
router.put('/:id', authMiddleware, updateNote);

// Delete a note
router.delete('/:id', authMiddleware, deleteNote);

export default router;