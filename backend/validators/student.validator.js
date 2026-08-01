import { body } from 'express-validator';
import { validateRequest } from '../middleware/validate.middleware.js';

/**
 * Validation rules for creating a student
 */
export const createStudentValidator = [
  body('studentName')
    .trim()
    .notEmpty()
    .withMessage('Student name is required'),
    
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
    
  body('rollNumber')
    .trim()
    .notEmpty()
    .withMessage('Roll number is required'),
    
  body('department')
    .trim()
    .notEmpty()
    .withMessage('Department is required'),
    
  body('branch')
    .trim()
    .notEmpty()
    .withMessage('Branch is required'),
    
  body('year')
    .trim()
    .notEmpty()
    .withMessage('Year is required'),
    
  validateRequest
];

/**
 * Validation rules for updating a student
 */
export const updateStudentValidator = [
  body('studentName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Student name cannot be empty'),
    
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
    
  body('rollNumber')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Roll number cannot be empty'),
    
  body('department')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Department cannot be empty'),
    
  body('branch')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Branch cannot be empty'),
    
  body('year')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Year cannot be empty'),
    
  validateRequest
];
