import { Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';

// Middleware to check validation results
export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};

// Auth validation rules
export const registerValidationRules = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

export const loginValidationRules = [
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').exists().withMessage('Password is required'),
];

// Document validation rules
export const documentIdValidationRules = [
  param('id').isMongoId().withMessage('Invalid document ID'),
];

export const createNoteValidationRules = [
  body('documentId').isMongoId().withMessage('Valid document ID is required'),
  body('content').notEmpty().withMessage('Content is required'),
];

export const updateNoteValidationRules = [
  param('id').isMongoId().withMessage('Invalid note ID'),
  body('content').notEmpty().withMessage('Content is required'),
];

export const chatValidationRules = [
  body('message').notEmpty().withMessage('Message is required'),
  body('documentId')
    .optional()
    .isMongoId()
    .withMessage('Invalid document ID'),
];

export const searchLogValidationRules = [
  body('query').notEmpty().withMessage('Search query is required'),
  body('documentContext')
    .optional()
    .isMongoId()
    .withMessage('Invalid document ID'),
];