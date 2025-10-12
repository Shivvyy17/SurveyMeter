// models/Survey.js
import mongoose from 'mongoose';

const surveySchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    minlength: 4,
  },
  title: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  questions: [
    {
      _id: mongoose.Schema.Types.ObjectId,
      questionText: String,
      options: [String],
    },
  ],
  responses: [
    {
      studentName: String,
      answers: [String],
      submittedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Survey', surveySchema);