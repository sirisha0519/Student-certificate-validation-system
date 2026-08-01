import mongoose from 'mongoose';

const verificationLogSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      required: true,
      trim: true
    },
    verifiedAt: {
      type: Date,
      default: Date.now
    },
    ipAddress: {
      type: String,
      default: 'Unknown'
    },
    status: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const VerificationLog = mongoose.model('VerificationLog', verificationLogSchema);
export default VerificationLog;
