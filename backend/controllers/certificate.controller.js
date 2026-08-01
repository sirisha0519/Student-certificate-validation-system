import * as certificateService from '../services/certificate.service.js';
import Student from '../models/student.model.js';

/**
 * @desc    Get all certificates (with optional search and filters)
 * @route   GET /api/certificates
 * @access  Private (Admin/Student)
 */
export const getCertificates = async (req, res, next) => {
  try {
    const filters = {};

    // If the logged-in user is a Student, restrict search to only their own certificates
    if (req.user.role === 'Student') {
      const student = await Student.findOne({ userId: req.user._id });
      if (!student) {
        return res.status(200).json({
          success: true,
          count: 0,
          data: []
        });
      }
      filters.studentId = student._id;
    } else {
      // If Admin, they can filter by search query (name, roll number, certificate ID)
      if (req.query.search) {
        filters.search = req.query.search;
      }
      // Or filter by specific student
      if (req.query.studentId) {
        filters.studentId = req.query.studentId;
      }
    }

    const certificates = await certificateService.getCertificates(filters);
    res.status(200).json({
      success: true,
      count: certificates.length,
      data: certificates
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single certificate by MongoDB ID or Certificate ID string
 * @route   GET /api/certificates/:id
 * @access  Private (Admin/Student)
 */
export const getCertificate = async (req, res, next) => {
  try {
    const certificate = await certificateService.getCertificateById(req.params.id);

    // If the logged-in user is a Student, make sure this certificate belongs to them
    if (req.user.role === 'Student') {
      const student = await Student.findOne({ userId: req.user._id });
      if (!student || certificate.studentId._id.toString() !== student._id.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Access denied: You are not authorized to view this certificate'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: certificate
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload certificate PDF, generate hash & QR code
 * @route   POST /api/certificates/upload
 * @access  Private/Admin
 */
export const uploadCertificate = async (req, res, next) => {
  try {
    const certificate = await certificateService.createCertificate(
      req.file,
      req.body,
      req.user._id
    );
    res.status(201).json({
      success: true,
      message: 'Certificate uploaded and generated successfully',
      data: certificate
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update certificate metadata
 * @route   PUT /api/certificates/:id
 * @access  Private/Admin
 */
export const updateCertificate = async (req, res, next) => {
  try {
    const certificate = await certificateService.updateCertificate(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Certificate updated successfully',
      data: certificate
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Revoke certificate status (mark as Revoked)
 * @route   PATCH /api/certificates/revoke/:id
 * @access  Private/Admin
 */
export const revokeCertificate = async (req, res, next) => {
  try {
    const certificate = await certificateService.revokeCertificate(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Certificate status revoked successfully',
      data: certificate
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete certificate record
 * @route   DELETE /api/certificates/:id
 * @access  Private/Admin
 */
export const deleteCertificate = async (req, res, next) => {
  try {
    const result = await certificateService.deleteCertificate(req.params.id);
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};
