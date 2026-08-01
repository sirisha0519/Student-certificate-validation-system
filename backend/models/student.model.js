import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    studentName: {
      type: String,
      required: true,
      trim: true
    },
    rollNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    department: {
      type: String,
      required: true,
      trim: true
    },
    branch: {
      type: String,
      required: true,
      trim: true
    },
    year: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const Student = mongoose.model('Student', studentSchema);
export default Student;
