import express from 'express';
import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent
} from '../controllers/student.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import {
  createStudentValidator,
  updateStudentValidator
} from '../validators/student.validator.js';

const router = express.Router();

// Apply auth protection & role check for all routes in this file
router.use(protect);
router.use(authorize('Admin'));

// GET /api/students & POST /api/students
router.route('/')
  .get(getStudents)
  .post(createStudentValidator, createStudent);

// PUT /api/students/:id & DELETE /api/students/:id
router.route('/:id')
  .put(updateStudentValidator, updateStudent)
  .delete(deleteStudent);

export default router;
