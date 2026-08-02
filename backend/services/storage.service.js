import { v2 as cloudinary } from 'cloudinary';
import path from 'path';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Check Cloudinary configuration
const isCloudinaryConfigured = () => {
  return (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

// Upload buffer to Cloudinary
const uploadStream = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );

    stream.end(buffer);
  });
};

// Upload Certificate PDF
export const uploadPDF = async (buffer, filename) => {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary is not configured');
  }

  console.log('Uploading PDF to Cloudinary...');

  return await uploadStream(buffer, {
    resource_type: 'raw',
    public_id: `certificates/${path.parse(filename).name}`,
    access_mode: 'public'
  });
};

// Upload QR Code
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