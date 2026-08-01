import * as studentService from '../services/student.service.js';

/**
 * @desc    Get all students
 * @route   GET /api/students
 * @access  Private/Admin
 */
export const getStudents = async (req, res, next) => {
  try {
    const students = await studentService.getAllStudents();
    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new student
 * @route   POST /api/students
 * @access  Private/Admin
 */
export const createStudent = async (req, res, next) => {
  try {
    const student = await studentService.createStudent(req.body);
    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: student
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update student details
 * @route   PUT /api/students/:id
 * @access  Private/Admin
 */
export const updateStudent = async (req, res, next) => {
  try {
    const student = await studentService.updateStudent(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: student
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a student
 * @route   DELETE /api/students/:id
 * @access  Private/Admin
 */
export const deleteStudent = async (req, res, next) => {
  try {
    const result = await studentService.deleteStudent(req.params.id);
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};
