// models/Student.js
import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  surveyResponses: [
    {
      surveyId: mongoose.Schema.Types.ObjectId,
      answers: [String],
      submittedAt: Date,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Student', studentSchema);