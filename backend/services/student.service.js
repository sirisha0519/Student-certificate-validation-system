import Student from '../models/student.model.js';
import User from '../models/user.model.js';

/**
 * Fetch all students with populated user credentials
 */
export const getAllStudents = async () => {
  return await Student.find().populate('userId', 'name email role');
};

/**
 * Fetch a student by MongoDB ID
 */
export const getStudentById = async (id) => {
  const student = await Student.findById(id).populate('userId', 'name email role');
  if (!student) {
    const error = new Error('Student not found');
    error.statusCode = 404;
    throw error;
  }
  return student;
};

/**
 * Create a new student and associate with a User account
 */
export const createStudent = async (studentData) => {
  const { studentName, email, rollNumber, department, branch, year } = studentData;

  // Check if student roll number is already registered
  const existingRoll = await Student.findOne({ rollNumber });
  if (existingRoll) {
    const error = new Error(`Roll number ${rollNumber} is already registered`);
    error.statusCode = 400;
    throw error;
  }

  // Check if a user with that email already exists
  let user = await User.findOne({ email });
  
  if (user) {
    // If user exists, check if they already have a student profile
    const existingProfile = await Student.findOne({ userId: user._id });
    if (existingProfile) {
      // If the existing student profile has roll number TBD, we can merge/update instead of failing
      if (existingProfile.rollNumber.startsWith('TEMP-') || existingProfile.rollNumber === 'TBD') {
        existingProfile.studentName = studentName;
        existingProfile.rollNumber = rollNumber;
        existingProfile.department = department;
        existingProfile.branch = branch;
        existingProfile.year = year;
        await existingProfile.save();
        return existingProfile;
      }
      
      const error = new Error('A student profile is already linked to this email address');
      error.statusCode = 400;
      throw error;
    }
  } else {
    // If no user exists, create one with the role 'Student'
    // Default password is set as the roll number
    user = await User.create({
      name: studentName,
      email,
      password: rollNumber,
      role: 'Student'
    });
  }

  // Create Student profile
  const student = await Student.create({
    userId: user._id,
    studentName,
    rollNumber,
    department,
    branch,
    year
  });

  return student;
};

/**
 * Update student profile and synchronize user credentials if modified
 */
export const updateStudent = async (id, updateData) => {
  const student = await Student.findById(id);
  if (!student) {
    const error = new Error('Student not found');
    error.statusCode = 404;
    throw error;
  }

  const { studentName, email, rollNumber, department, branch, year } = updateData;

  // If roll number is changing, verify it's unique
  if (rollNumber && rollNumber !== student.rollNumber) {
    const rollConflict = await Student.findOne({ rollNumber });
    if (rollConflict) {
      const error = new Error(`Roll number ${rollNumber} is already in use`);
      error.statusCode = 400;
      throw error;
    }
    student.rollNumber = rollNumber;
  }

  // Update student fields
  if (studentName) student.studentName = studentName;
  if (department) student.department = department;
  if (branch) student.branch = branch;
  if (year) student.year = year;

  await student.save();

  // If email or name changed, update the user document
  if (email || studentName) {
    const user = await User.findById(student.userId);
    if (user) {
      if (studentName) user.name = studentName;
      if (email && email !== user.email) {
        const emailConflict = await User.findOne({ email });
        if (emailConflict) {
          const error = new Error(`Email ${email} is already in use`);
          error.statusCode = 400;
          throw error;
        }
        user.email = email;
      }
      await user.save();
    }
  }

  return await Student.findById(id).populate('userId', 'name email role');
};

/**
 * Delete student and delete associated authentication user
 */
export const deleteStudent = async (id) => {
  const student = await Student.findById(id);
  if (!student) {
    const error = new Error('Student not found');
    error.statusCode = 404;
    throw error;
  }

  // Delete associated user
  await User.findByIdAndDelete(student.userId);
  
  // Delete student profile
  await Student.findByIdAndDelete(id);

  return { message: 'Student and associated user account deleted successfully' };
};
