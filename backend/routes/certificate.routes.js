import express from 'express';
import {
  getCertificates,
  getCertificate,
  uploadCertificate,
  updateCertificate,
  revokeCertificate,
  deleteCertificate
} from '../controllers/certificate.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import {
  createCertificateValidator,
  updateCertificateValidator
} from '../validators/certificate.validator.js';

const router = express.Router();

// Apply base protection to all routes in this file (must be logged in)
router.use(protect);

// GET /api/certificates - accessible by both Admin (lists all/filtered) and Student (lists only their own)
router.get('/', getCertificates);

// GET /api/certificates/:id - accessible by both Admin and Student (with own-check)
router.get('/:id', getCertificate);

// ADMIN ONLY ROUTES BELOW

// POST /api/certificates/upload
router.post(
  '/upload',
  authorize('Admin'),
  upload.single('pdf'),             // Intercept multipart file uploads
  createCertificateValidator,      // Validate text fields
  uploadCertificate
);

// PUT /api/certificates/:id
router.put('/:id', authorize('Admin'), updateCertificateValidator, updateCertificate);

// PATCH /api/certificates/revoke/:id
router.patch('/revoke/:id', authorize('Admin'), revokeCertificate);

// DELETE /api/certificates/:id
router.delete('/:id', authorize('Admin'), deleteCertificate);

export default router;
