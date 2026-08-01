import express from 'express';
import { verifyCertificate, verifyCertificateWithFile } from '../controllers/verify.controller.js';
import { upload } from '../middleware/upload.middleware.js';

const router = express.Router();

// GET /api/verify/:certificateId - Verify by ID
router.get('/:certificateId', verifyCertificate);

// POST /api/verify/:certificateId - Verify by PDF Upload
router.post('/:certificateId', upload.single('pdf'), verifyCertificateWithFile);

export default router;
