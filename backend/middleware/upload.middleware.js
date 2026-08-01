import multer from 'multer';

// Use memory storage to store the file as a Buffer in memory temporarily
const storage = multer.memoryStorage();

// File filter to allow only PDF files
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF certificates are allowed!'), false);
  }
};

// Set limits (e.g. maximum file size 5MB)
const limits = {
  fileSize: 5 * 1024 * 1024 // 5 MB
};

export const upload = multer({
  storage,
  fileFilter,
  limits
});
