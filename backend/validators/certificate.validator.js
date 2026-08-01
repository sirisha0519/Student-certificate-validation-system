import { body } from 'express-validator';
import { validateRequest } from '../middleware/validate.middleware.js';

/**
 * Validation rules for uploading a certificate
 */
export const createCertificateValidator = [
  body('studentId')
    .trim()
    .isMongoId()
    .withMessage('A valid Student MongoDB ID is required'),
    
  body('course')
    .trim()
    .notEmpty()
    .withMessage('Course name is required'),
    
  body('issueDate')
    .trim()
    .isISO8601()
    .withMessage('A valid Issue Date (ISO 8601 format) is required'),
    
  validateRequest
];

/**
 * Validation rules for updating certificate metadata
 */
export const updateCertificateValidator = [
  body('course')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Course name cannot be empty'),
    
  body('issueDate')
    .optional()
    .trim()
    .isISO8601()
    .withMessage('Please enter a valid date format'),
    
  body('status')
    .optional()
    .isIn(['Active', 'Revoked', 'Expired'])
    .withMessage('Status must be Active, Revoked, or Expired'),
    
  validateRequest
];
