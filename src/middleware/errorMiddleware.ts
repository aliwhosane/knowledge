import { Request, Response, NextFunction } from 'express';

// Interface for custom errors with status codes
interface AppError extends Error {
  statusCode?: number;
}

// Error handler middleware
const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Set default status code if not provided
  const statusCode = err.statusCode || 500;
  
  // Log error for server-side debugging
  console.error(`[ERROR] ${err.message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Send error response
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};

// Not found middleware
const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not Found - ${req.originalUrl}`) as AppError;
  error.statusCode = 404;
  next(error);
};

export { errorHandler, notFound };