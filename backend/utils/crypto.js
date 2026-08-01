import crypto from 'crypto';

/**
 * Generates a SHA-256 hash from a file buffer.
 * This represents the actual binary contents of the certificate.
 * @param {Buffer} fileBuffer - The file buffer to hash.
 * @returns {string} - Hex representation of the SHA-256 hash.
 */
export const generateSHA256 = (fileBuffer) => {
  return crypto
    .createHash('sha256')
    .update(fileBuffer)
    .digest('hex');
};
