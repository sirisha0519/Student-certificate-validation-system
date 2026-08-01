import express from 'express';
import { getLogs } from '../controllers/verify.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// GET /api/logs - Fetch all verification logs (Protected: Admin only)
router.get('/', protect, authorize('Admin'), getLogs);

export default router;
