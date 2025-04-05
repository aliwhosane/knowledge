import express, { Router } from 'express';
import { registerUser, loginUser } from '../controllers/authController';
import { registerValidation, loginValidation } from '../middleware/validationMiddleware';

const router: Router = express.Router();

// Register user with validation
router.post('/register', registerValidation, registerUser);

// Login user with validation
router.post('/login', loginValidation, loginUser);

export default router;