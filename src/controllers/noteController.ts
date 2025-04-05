import { Request, Response } from 'express';
import Note from '../models/Note';
import DocumentModel from '../models/Document';

// @desc    Create a new note
// @route   POST /api/notes
// @access  Private
export const createNote = async (req: Request, res: Response) => {
  try {
    const { documentId, content } = req.body;

    if (!documentId || !content) {
      return res.status(400).json({ message: 'Document ID and content are required' });
    }

    // Verify the document belongs to the user
    const document = await DocumentModel.findOne({ _id: documentId, user: (req as any).user._id });
    if (!document) {
      return res.status(404).json({ message: 'Document not found or not authorized' });
    }

    // Create a new note
    const note = await Note.create({
      user: (req as any).user._id,
      document: documentId,
      content
    });

    res.status(201).json(note);
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all notes for a specific document
// @route   GET /api/notes/document/:documentId
// @access  Private
export const getNotesForDocument = async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;

    // Verify the document belongs to the user
    const document = await DocumentModel.findOne({ _id: documentId, user: (req as any).user._id });
    if (!document) {
      return res.status(404).json({ message: 'Document not found or not authorized' });
    }

    // Get all notes for the document
    const notes = await Note.find({ document: documentId, user: (req as any).user._id });
    res.json(notes);
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private
export const updateNote = async (req: Request, res: Response) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    // Find the note and verify it belongs to the user
    const note = await Note.findOne({ _id: req.params.id, user: (req as any).user._id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found or not authorized' });
    }

    // Update the note
    note.content = content;
    note.updatedAt = new Date();
    await note.save();

    res.json(note);
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
export const deleteNote = async (req: Request, res: Response) => {
  try {
    // Find the note and verify it belongs to the user
    const note = await Note.findOne({ _id: req.params.id, user: (req as any).user._id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found or not authorized' });
    }

    // Delete the note
    await note.deleteOne();
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};