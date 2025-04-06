import express, { Router } from 'express';
import { registerUser, loginUser } from '../controllers/authController';
import { 
  registerValidationRules, 
  loginValidationRules, 
  validateRequest 
} from '../middleware/validationMiddleware';

const router: Router = express.Router();

// Register user with validation
router.post('/register', registerValidationRules, validateRequest, registerUser);

// Login user with validation
router.post('/login', loginValidationRules, validateRequest, loginUser);

export default router;