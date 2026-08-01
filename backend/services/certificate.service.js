import { v4 as uuidv4 } from 'uuid';
import Certificate from '../models/certificate.model.js';
import Student from '../models/student.model.js';
import { generateSHA256 } from '../utils/crypto.js';
import { generateQRCodeBuffer } from '../utils/qrcode.js';
import * as storageService from './storage.service.js';

/**
 * Fetch certificates with query filter, search parameter, and pagination
 */
export const getCertificates = async (filters = {}) => {
  const { search, studentId } = filters;
  let query = {};

  if (studentId) {
    query.studentId = studentId;
  }

  // Admin Search filter: search by studentName, rollNumber, or certificateId
  if (search) {
    const studentMatches = await Student.find({
      $or: [
        { studentName: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } }
      ]
    });
    
    const studentIds = studentMatches.map(s => s._id);

    query.$or = [
      { certificateId: { $regex: search, $options: 'i' } },
      { studentId: { $in: studentIds } }
    ];
  }

  return await Certificate.find(query)
    .populate('studentId', 'studentName rollNumber department branch year')
    .populate('uploadedBy', 'name email')
    .sort({ createdAt: -1 });
};

/**
 * Fetch a single certificate by MongoDB ID or Certificate ID
 */
export const getCertificateById = async (id) => {
  // Search either by MongoDB _id or the custom certificateId string
  const isMongoId = id.match(/^[0-9a-fA-H]{24}$/i);
  let certificate;

  if (isMongoId) {
    certificate = await Certificate.findById(id)
      .populate('studentId', 'studentName rollNumber department branch year')
      .populate('uploadedBy', 'name email');
  } else {
    certificate = await Certificate.findOne({ certificateId: id })
      .populate('studentId', 'studentName rollNumber department branch year')
      .populate('uploadedBy', 'name email');
  }

  if (!certificate) {
    const error = new Error('Certificate not found');
    error.statusCode = 404;
    throw error;
  }

  return certificate;
};

/**
 * Handle certificate PDF upload, metadata storage, hashing, and QR generation
 */
export const createCertificate = async (file, certificateData, adminId) => {
  const { studentId, course, issueDate } = certificateData;

  if (!file) {
    const error = new Error('Certificate PDF file is required');
    error.statusCode = 400;
    throw error;
  }

  // 1. Verify that the student exists in the database
  const student = await Student.findById(studentId);
  if (!student) {
    const error = new Error('Selected student does not exist');
    error.statusCode = 404;
    throw error;
  }

  // 2. Generate the cryptographic SHA-256 hash of the uploaded PDF file
  const hashValue = generateSHA256(file.buffer);

  // Check if this certificate PDF has already been uploaded (integrity check)
  const existingHash = await Certificate.findOne({ hashValue });
  if (existingHash) {
    const error = new Error('This certificate file (identical hash) has already been uploaded');
    error.statusCode = 400;
    throw error;
  }

  // 3. Generate a unique Certificate ID using UUID (Example: CERT-4F8A92C1)
  let certificateId;
  let isUnique = false;
  while (!isUnique) {
    const uuidPart = uuidv4().split('-')[0].toUpperCase();
    certificateId = `CERT-${uuidPart}`;
    const duplicateId = await Certificate.findOne({ certificateId });
    if (!duplicateId) {
      isUnique = true;
    }
  }

  // 4. Generate the verification URL that will be printed in the QR Code
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const verificationUrl = `${frontendUrl}/verify/${certificateId}`;

  // 5. Generate QR Code image as a buffer
  const qrBuffer = await generateQRCodeBuffer(verificationUrl);

  // 6. Upload files to storage (Cloudinary or local fallback)
  const pdfUrl = await storageService.uploadPDF(file.buffer, file.originalname);
  const qrCodeUrl = await storageService.uploadQRCode(qrBuffer, certificateId);

  // 7. Save certificate record to database
  const certificate = await Certificate.create({
    certificateId,
    studentId,
    course,
    issueDate: new Date(issueDate),
    pdfUrl,
    hashValue,
    qrCodeUrl,
    status: 'Active',
    uploadedBy: adminId
  });

  return certificate;
};

/**
 * Update certificate details (course or issueDate only)
 */
export const updateCertificate = async (id, updateData) => {
  const certificate = await Certificate.findById(id);
  if (!certificate) {
    const error = new Error('Certificate not found');
    error.statusCode = 404;
    throw error;
  }

  const { course, issueDate, status } = updateData;

  if (course) certificate.course = course;
  if (issueDate) certificate.issueDate = new Date(issueDate);
  if (status) certificate.status = status;

  return await certificate.save();
};

/**
 * Revoke certificate status to 'Revoked'
 */
export const revokeCertificate = async (id) => {
  const certificate = await Certificate.findById(id);
  if (!certificate) {
    const error = new Error('Certificate not found');
    error.statusCode = 404;
    throw error;
  }

  certificate.status = 'Revoked';
  await certificate.save();

  return certificate;
};

/**
 * Delete a certificate from database
 */
export const deleteCertificate = async (id) => {
  const certificate = await Certificate.findById(id);
  if (!certificate) {
    const error = new Error('Certificate not found');
    error.statusCode = 404;
    throw error;
  }

  await Certificate.findByIdAndDelete(id);
  return { message: 'Certificate record deleted successfully' };
};
