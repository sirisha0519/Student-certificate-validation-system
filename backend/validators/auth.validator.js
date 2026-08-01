import { body } from 'express-validator';
import { validateRequest } from '../middleware/validate.middleware.js';

/**
 * Validation rules for registration route
 */
export const registerValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
  
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('role')
    .optional()
    .isIn(['Admin', 'Student'])
    .withMessage('Role must be either Admin or Student'),
    
  validateRequest
];

/**
 * Validation rules for login route
 */
export const loginValidator = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
    
  validateRequest
];
