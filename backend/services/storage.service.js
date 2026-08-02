import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Check if Cloudinary is fully configured in environment variables
const isCloudinaryConfigured = () => {
  const name = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  
  return (
    name && name !== 'your_cloud_name' &&
    key && key !== 'your_api_key' &&
    secret && secret !== 'your_api_secret'
  );
};

/**
 * Uploads a file buffer to Cloudinary using stream.
 * @param {Buffer} buffer - The file buffer.
 * @param {Object} options - Cloudinary upload options.
 * @returns {Promise<string>} - The secure URL of the uploaded file.
 */
const uploadStream = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        console.error('Cloudinary stream upload error:', error);
        reject(error);
      } else {
        resolve(result.secure_url);
      }
    });
    stream.end(buffer);
  });
};

/**
 * Uploads a PDF to storage.
 * @param {Buffer} buffer - PDF file buffer.
 * @param {string} filename - Desired filename.
 * @returns {Promise<string>} - The URL of the stored PDF file.
 */
export const uploadQRCode = async (buffer, certificateId) => {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured');
  }

  console.log('Uploading QR Code to Cloudinary...');

  return await uploadStream(buffer, {
    resource_type: 'image',
    folder: 'qrcodes',
    public_id: certificateId
  });
};

  // Fallback to local storage
  console.log('Using local storage for PDF...');
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const safeFilename = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
  const filePath = path.join(uploadsDir, safeFilename);
  fs.writeFileSync(filePath, buffer);

  // Return local file URL
  const port = process.env.PORT || 5000;
  return `http://localhost:${port}/uploads/${safeFilename}`;


/**
 * Uploads a QR code image to storage.
 * @param {Buffer} buffer - QR code PNG buffer.
 * @param {string} certificateId - Certificate ID.
 * @returns {Promise<string>} - The URL of the stored QR code image.
 */
export const uploadQRCode = async (buffer, certificateId) => {
  if (isCloudinaryConfigured()) {
    try {
      console.log('Uploading QR Code to Cloudinary...');
      return await uploadStream(buffer, {
        resource_type: 'image',
        folder: 'qrcodes',
        public_id: certificateId
      });
    } catch (err) {
      console.error('Cloudinary QR upload failed, falling back to local storage:', err.message);
    }
  }

  // Fallback to local storage
  console.log('Using local storage for QR Code...');
  const qrDir = path.join(process.cwd(), 'uploads', 'qrcodes');
  if (!fs.existsSync(qrDir)) {
    fs.mkdirSync(qrDir, { recursive: true });
  }

  const filename = `${certificateId}.png`;
  const filePath = path.join(qrDir, filename);
  fs.writeFileSync(filePath, buffer);

  const port = process.env.PORT || 5000;
  return `http://localhost:${port}/uploads/qrcodes/${filename}`;
};
