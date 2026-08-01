import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    course: {
      type: String,
      required: true,
      trim: true
    },
    issueDate: {
      type: Date,
      required: true
    },
    pdfUrl: {
      type: String,
      required: true
    },
    hashValue: {
      type: String,
      required: true,
      trim: true
    },
    qrCodeUrl: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['Active', 'Revoked', 'Expired'],
      default: 'Active'
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Certificate = mongoose.model('Certificate', certificateSchema);
export default Certificate;
