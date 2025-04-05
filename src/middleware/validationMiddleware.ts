import { Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';

// Middleware to check validation results
const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Auth validation rules
const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  validateRequest,
];

const loginValidation = [
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').exists().withMessage('Password is required'),
  validateRequest,
];

// Document validation rules
const documentIdValidation = [
  param('id').isMongoId().withMessage('Invalid document ID'),
  validateRequest,
];

const createNoteValidation = [
  body('documentId').isMongoId().withMessage('Valid document ID is required'),
  body('content').notEmpty().withMessage('Content is required'),
  validateRequest,
];

const updateNoteValidation = [
  param('id').isMongoId().withMessage('Invalid note ID'),
  body('content').notEmpty().withMessage('Content is required'),
  validateRequest,
];

const chatValidation = [
  body('prompt').notEmpty().withMessage('Prompt is required'),
  body('documentId')
    .optional()
    .isMongoId()
    .withMessage('Invalid document ID'),
  validateRequest,
];

const searchLogValidation = [
  body('query').notEmpty().withMessage('Search query is required'),
  body('documentContext')
    .optional()
    .isMongoId()
    .withMessage('Invalid document ID'),
  validateRequest,
];

export {
  registerValidation,
  loginValidation,
  documentIdValidation,
  createNoteValidation,
  updateNoteValidation,
  chatValidation,
  searchLogValidation,
};