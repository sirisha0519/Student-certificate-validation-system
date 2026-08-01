import * as verifyService from '../services/verify.service.js';

/**
 * @desc    Verify certificate by ID (Public search / QR Code scan)
 * @route   GET /api/verify/:certificateId
 * @access  Public
 */
export const verifyCertificate = async (req, res, next) => {
  try {
    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown';
    const result = await verifyService.verifyCertificateById(req.params.certificateId, ipAddress);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Verify certificate by uploading the file for binary comparison
 * @route   POST /api/verify/:certificateId
 * @access  Public
 */
export const verifyCertificateWithFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'PDF file is required for verification'
      });
    }

    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown';
    const result = await verifyService.verifyCertificateFile(
      req.params.certificateId,
      req.file.buffer,
      ipAddress
    );

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all verification logs
 * @route   GET /api/logs
 * @access  Private/Admin
 */
export const getLogs = async (req, res, next) => {
  try {
    const logs = await verifyService.getVerificationLogs();
    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    next(error);
  }
};
