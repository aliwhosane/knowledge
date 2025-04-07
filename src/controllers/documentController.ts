import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import DocumentModel from '../models/Document';
import { extractTextFromFile } from '../services/textExtractorService';
import { generateSummary } from '../services/geminiService';
import { generateQa } from '../services/geminiService';
import { generateQuiz } from '../services/geminiService';
import config from '../config/config';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.resolve(__dirname, '../../', config.UPLOAD_PATH);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
  fileFilter: (req, file, cb) => {
    const fileTypes = /pdf|docx|txt/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('File type not supported'));
    }
  },
}).single('file');

// @desc    Upload a document
// @route   POST /api/documents/upload
// @access  Private
export const uploadDocument = async (req: Request, res: Response) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
      const { originalname, path: storagePath, mimetype } = req.file;

      // Create a new Document record
      const document = await DocumentModel.create({
        user: (req as any).user._id,
        originalFilename: originalname,
        storagePath,
        fileType: mimetype,
        status: 'processing', // or 'ready' depending on your logic
      });

      res.status(201).json(document);
    } catch (error) {
      console.error('Document upload error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
};

// @desc    Get all documents for the logged-in user
// @route   GET /api/documents
// @access  Private
export const getUserDocuments = async (req: Request, res: Response) => {
  try {
    const documents = await DocumentModel.find({ user: (req as any).user._id });
    res.json(documents);
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get a single document by ID
// @route   GET /api/documents/:id
// @access  Private
export const getSingleDocument = async (req: Request, res: Response) => {
  try {
    const document = await DocumentModel.findOne({ _id: req.params.id, user: (req as any).user._id });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    console.error('Get single document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a document by ID
// @route   DELETE /api/documents/:id
// @access  Private
export const deleteDocument = async (req: Request, res: Response) => {
  try {
    const document = await DocumentModel.findOne({ _id: req.params.id, user: (req as any).user._id });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Delete the file from the filesystem
    fs.unlink(document.storagePath, async (err) => {
      if (err) {
        console.error('File deletion error:', err);
        return res.status(500).json({ message: 'Server error' });
      }

      // Delete the document record from MongoDB
      await document.deleteOne();
      res.json({ message: 'Document deleted successfully' });
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Process document and generate summary
// @route   POST /api/documents/:id/process/summary
// @access  Private
export const processDocumentSummary = async (req: Request, res: Response) => {
  try {
    // Find the document and verify it belongs to the user
    const document = await DocumentModel.findOne({ _id: req.params.id, user: (req as any).user._id });
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found or not authorized' });
    }

    // Update status to processing
    document.status = 'processing';
    await document.save();

    try {
      // Extract text from the document
      const extractedText = await extractTextFromFile(document.storagePath, document.fileType);

      if (!extractedText || extractedText.trim() === '') {
        document.status = 'error';
        await document.save();
        return res.status(400).json({ message: 'Could not extract text from document' });
      }

      // Generate summary using Gemini
      const summary = await generateSummary(extractedText);
      // Update document with summary
      document.summary = summary;
      document.status = 'ready';
      await document.save();

      res.json({
        message: 'Document processed successfully',
        document
      });
    } catch (error) {
      console.error('Document processing error:', error);
      
      // Update document status to error
      document.status = 'error';
      await document.save();
      
      res.status(500).json({ message: `Processing failed: ${(error as Error).message}` });
    }
  } catch (error) {
    console.error('Document processing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Process document and generate Q&A
// @route   POST /api/documents/:id/process/qa
// @access  Private
export const processDocumentQa = async (req: Request, res: Response) => {
  try {
    // Find the document and verify it belongs to the user
    const document = await DocumentModel.findOne({ _id: req.params.id, user: (req as any).user._id });
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found or not authorized' });
    }

    // Update status to processing
    document.status = 'processing';
    await document.save();

    try {
      // Extract text from the document
      const extractedText = await extractTextFromFile(document.storagePath, document.fileType);
      
      if (!extractedText || extractedText.trim() === '') {
        document.status = 'error';
        await document.save();
        return res.status(400).json({ message: 'Could not extract text from document' });
      }

      // Generate Q&A using Gemini
      const qaArray = await generateQa(extractedText);
      
      // Update document with Q&A
      document.generatedQuestions = qaArray;
      document.status = 'ready';
      await document.save();

      res.json({
        message: 'Q&A generated successfully',
        document
      });
    } catch (error) {
      console.error('Q&A generation error:', error);
      
      // Update document status to error
      document.status = 'error';
      await document.save();
      
      res.status(500).json({ message: `Q&A generation failed: ${(error as Error).message}` });
    }
  } catch (error) {
    console.error('Document processing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Process document and generate quiz
// @route   POST /api/documents/:id/process/quiz
// @access  Private
export const processDocumentQuiz = async (req: Request, res: Response) => {
  try {
    // Find the document and verify it belongs to the user
    const document = await DocumentModel.findOne({ _id: req.params.id, user: (req as any).user._id });
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found or not authorized' });
    }

    // Update status to processing
    document.status = 'processing';
    await document.save();

    try {
      // Extract text from the document
      const extractedText = await extractTextFromFile(document.storagePath, document.fileType);
      
      if (!extractedText || extractedText.trim() === '') {
        document.status = 'error';
        await document.save();
        return res.status(400).json({ message: 'Could not extract text from document' });
      }

      // Generate quiz using Gemini
      const quizArray = await generateQuiz(extractedText);
      
      // Update document with quiz
      document.generatedQuiz = quizArray;
      document.status = 'ready';
      await document.save();

      res.json({
        message: 'Quiz generated successfully',
        document
      });
    } catch (error) {
      console.error('Quiz generation error:', error);
      
      // Update document status to error
      document.status = 'error';
      await document.save();
      
      res.status(500).json({ message: `Quiz generation failed: ${(error as Error).message}` });
    }
  } catch (error) {
    console.error('Document processing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get quiz details for a specific document
// @route   GET /api/documents/:id/quiz
// @access  Private
export const getDocumentQuiz = async (req: Request, res: Response) => {
  try {
    const document = await DocumentModel.findOne({ _id: req.params.id, user: (req as any).user._id });

    if (!document || !document.generatedQuiz) {
      return res.status(404).json({ message: 'Quiz not found for this document' });
    }
    console.log(document.generatedQuiz)
    res.json(document.generatedQuiz);
  } catch (error) {
    console.error('Get document quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};