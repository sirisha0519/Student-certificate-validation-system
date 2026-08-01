import User from '../models/user.model.js';
import Student from '../models/student.model.js';
import { generateToken } from '../utils/jwt.js';

/**
 * Service to handle user registration
 * @param {Object} userData - User registration data (name, email, password, role)
 * @returns {Object} - Created user, token, and role
 */
export const registerUser = async (userData) => {
  const { name, email, password, role } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('Email is already registered');
    error.statusCode = 400;
    throw error;
  }

  // Create User
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'Student'
  });

  // If registering as a Student, we can initialize a default Student profile.
  // The Admin can later update this profile with full academic details (Roll Number, Department, etc.).
  if (user.role === 'Student') {
    // Generate a temporary unique roll number based on timestamp to avoid unique validation conflicts
    const tempRollNumber = `TEMP-${Date.now()}`;
    await Student.create({
      userId: user._id,
      studentName: user.name,
      rollNumber: tempRollNumber,
      department: 'TBD',
      branch: 'TBD',
      year: 'TBD'
    });
  }

  const token = generateToken(user._id, user.role);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    token
  };
};

/**
 * Service to handle user login
 * @param {Object} credentials - User credentials (email, password)
 * @returns {Object} - Authenticated user details and token
 */
export const loginUser = async (credentials) => {
  const { email, password } = credentials;

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Verify password using User model instance method
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user._id, user.role);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    token
  };
};
