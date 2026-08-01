import QRCode from 'qrcode';

/**
 * Generates a QR Code as a Buffer (useful for uploading to Cloudinary or writing to disk).
 * @param {string} text - The URL or text to encode.
 * @returns {Promise<Buffer>} - Resolves to QR Code buffer.
 */
export const generateQRCodeBuffer = async (text) => {
  try {
    return await QRCode.toBuffer(text, {
      type: 'png',
      width: 300,
      margin: 2
    });
  } catch (error) {
    console.error('Failed to generate QR Code buffer:', error.message);
    throw error;
  }
};

/**
 * Generates a QR Code as a Base64 Data URL (useful for quick client rendering).
 * @param {string} text - The URL or text to encode.
 * @returns {Promise<string>} - Resolves to base64 Data URL.
 */
export const generateQRCodeDataURL = async (text) => {
  try {
    return await QRCode.toDataURL(text, {
      width: 300,
      margin: 2
    });
  } catch (error) {
    console.error('Failed to generate QR Code Data URL:', error.message);
    throw error;
  }
};
