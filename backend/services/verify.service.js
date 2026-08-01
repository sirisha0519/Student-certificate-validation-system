import Certificate from '../models/certificate.model.js';
import VerificationLog from '../models/log.model.js';
import Student from '../models/student.model.js';
import { generateSHA256 } from '../utils/crypto.js';

/**
 * Publicly verifies a certificate by its unique Certificate ID string.
 * Automatically saves a verification audit log.
 * @param {string} certificateId - Certificate ID string (e.g. CERT-XXXXXX).
 * @param {string} ipAddress - IP address of the requester.
 * @returns {Promise<Object>} - Verification status and details.
 */
export const verifyCertificateById = async (certificateId, ipAddress) => {
  // 1. Fetch certificate
  const certificate = await Certificate.findOne({ certificateId })
    .populate('studentId', 'studentName rollNumber department branch year')
    .populate('uploadedBy', 'name email');

  // 2. If certificate does not exist in our system
  if (!certificate) {
    await VerificationLog.create({
      certificateId,
      status: 'Invalid',
      ipAddress
    });
    return {
      isValid: false,
      status: 'Invalid',
      message: '❌ Invalid Certificate: Certificate ID not found in our database.'
    };
  }

  // 3. Inspect status
  let statusText = 'Valid';
  let messageText = '✅ Genuine Certificate';
  let isValid = true;

  if (certificate.status === 'Revoked') {
    statusText = 'Revoked';
    messageText = '⚠️ Revoked Certificate: This certificate has been officially revoked by the administrator.';
    isValid = false;
  } else if (certificate.status === 'Expired') {
    statusText = 'Expired';
    messageText = '❌ Expired Certificate: This certificate has expired.';
    isValid = false;
  }

  // 4. Log the verification check
  await VerificationLog.create({
    certificateId,
    status: statusText,
    ipAddress
  });

  return {
    isValid,
    status: statusText,
    message: messageText,
    certificate
  };
};

/**
 * Publicly verifies a certificate's integrity by comparing its file hash.
 * @param {string} certificateId - Certificate ID.
 * @param {Buffer} fileBuffer - PDF file buffer uploaded by the verifier.
 * @param {string} ipAddress - IP address.
 */
export const verifyCertificateFile = async (certificateId, fileBuffer, ipAddress) => {
  const certificate = await Certificate.findOne({ certificateId })
    .populate('studentId', 'studentName rollNumber department branch year');

  if (!certificate) {
    await VerificationLog.create({
      certificateId,
      status: 'Invalid',
      ipAddress
    });
    return {
      isValid: false,
      status: 'Invalid',
      message: '❌ Invalid Certificate: Certificate ID not found.'
    };
  }

  // Generate SHA-256 hash of the uploaded PDF file
  const uploadedHash = generateSHA256(fileBuffer);

  // Compare file hash
  if (uploadedHash !== certificate.hashValue) {
    await VerificationLog.create({
      certificateId,
      status: 'Tampered',
      ipAddress
    });
    return {
      isValid: false,
      status: 'Tampered',
      message: '❌ Invalid Certificate: The file uploaded does not match our records (Hash mismatch). It may have been tampered with.'
    };
  }

  // Hash is genuine, check status
  let statusText = 'Valid';
  let messageText = '✅ Genuine Certificate (File Verified)';
  let isValid = true;

  if (certificate.status === 'Revoked') {
    statusText = 'Revoked';
    messageText = '⚠️ Revoked Certificate: The file is authentic but the certificate has been officially revoked.';
    isValid = false;
  } else if (certificate.status === 'Expired') {
    statusText = 'Expired';
    messageText = '❌ Expired Certificate: The file is authentic but has expired.';
    isValid = false;
  }

  await VerificationLog.create({
    certificateId,
    status: `${statusText} (File Hash Verified)`,
    ipAddress
  });

  return {
    isValid,
    status: statusText,
    message: messageText,
    certificate
  };
};

/**
 * Fetch all verification logs (Admin use)
 */
export const getVerificationLogs = async () => {
  return await VerificationLog.find().sort({ verifiedAt: -1 });
};
