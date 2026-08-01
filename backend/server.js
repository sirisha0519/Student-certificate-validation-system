import dns from 'dns';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/error.middleware.js';
import authRoutes from './routes/auth.routes.js';
import studentRoutes from './routes/student.routes.js';
import certificateRoutes from './routes/certificate.routes.js';
import verifyRoutes from './routes/verify.routes.js';
import logRoutes from './routes/log.routes.js';
dns.setServers(['8.8.8.8', '8.8.4.4']);
// Load environment variables from .env file
dotenv.config();

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5173'
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Parse incoming JSON and URL-encoded payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve temporary/static uploads directory if needed (e.g. for fallback/local files)
app.use('/uploads', express.static('uploads'));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/logs', logRoutes);

// Basic health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Student Certificate Validation System API is running smoothly'
  });
});

// Centralized error handler (must be registered after all other routes)
app.use(errorHandler);

// Start listening on configured port
app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
