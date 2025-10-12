// routes/surveys.js
import express from 'express';
import mongoose from 'mongoose';
import Survey from '../models/Survey.js';
import { protect, isTeacher } from '../middleware/auth.js';

const router = express.Router();

// Helper: Generate unique numeric survey code
const generateSurveyCode = async () => {
  let code;
  let exists = true;
  
  while (exists) {
    code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
    exists = await Survey.findOne({ code });
  }
  
  return code;
};

// @route   POST /api/surveys
// @desc    Create a new survey (teachers only)
// @access  Private/Teacher
router.post('/', protect, isTeacher, async (req, res) => {
  try {
    const { title, questions } = req.body;

    if (!title || !questions || questions.length === 0) {
      return res.status(400).json({ error: 'Title and questions required' });
    }

    // Validate questions
    for (const q of questions) {
      if (!q.questionText || !q.options || q.options.length < 2) {
        return res.status(400).json({ 
          error: 'Each question must have text and at least 2 options' 
        });
      }
    }

    const code = await generateSurveyCode();

    const survey = new Survey({
      code,
      title,
      createdBy: req.userId,
      questions: questions.map(q => ({
        _id: new mongoose.Types.ObjectId(),
        questionText: q.questionText,
        options: q.options,
      })),
      responses: [],
    });

    await survey.save();

    res.status(201).json({
      success: true,
      message: 'Survey created successfully',
      survey: {
        _id: survey._id,
        code: survey.code,        // ← Make sure this is included
        title: survey.title,
        questions: survey.questions,
        responses: survey.responses,
        createdAt: survey.createdAt,
        createdBy: survey.createdBy,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/surveys
// @desc    Get all surveys created by teacher
// @access  Private/Teacher
router.get('/', protect, isTeacher, async (req, res) => {
  try {
    const surveys = await Survey.find({ createdBy: req.userId });

    res.json({
      success: true,
      surveys,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/surveys/:id
// @desc    Get survey by ID (teacher views own, or get by code for students)
// @access  Private/Teacher or Public (if accessing by code)
router.get('/:id', async (req, res) => {
  try {
    // Try to find by ID first (for teachers)
    let survey = await Survey.findById(req.params.id);

    // If not found by ID, try by code (for students)
    if (!survey) {
      survey = await Survey.findOne({ code: req.params.id });
    }

    if (!survey) {
      console.log(`Survey not found - ID: ${req.params.id}`);  // ← Debug log
      return res.status(404).json({ error: 'Survey not found' });
    }

    res.json({
      success: true,
      survey,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/surveys/:code/submit
// @desc    Submit survey responses (students - no auth required)
// @access  Public
router.post('/:code/submit', async (req, res) => {
  try {
    const { studentName, answers } = req.body;

    const survey = await Survey.findOne({ code: req.params.code });

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    if (!studentName || !answers) {
      return res.status(400).json({ error: 'Student name and answers required' });
    }

    // Add response
    survey.responses.push({
      studentName,
      answers,
      submittedAt: new Date(),
    });

    await survey.save();

    res.json({
      success: true,
      message: 'Response submitted successfully',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/surveys/:id/results
// @desc    Get survey results (teachers only)
// @access  Private/Teacher
router.get('/:id/results', protect, isTeacher, async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    if (survey.createdBy.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to view these results' });
    }

    // Calculate statistics
    const stats = survey.questions.map(q => {
      const counts = {};
      q.options.forEach(opt => (counts[opt] = 0));

      survey.responses.forEach(resp => {
        const answer = resp.answers[survey.questions.indexOf(q)];
        if (answer) counts[answer]++;
      });

      return {
        questionText: q.questionText,
        options: q.options,
        counts,
      };
    });

    res.json({
      success: true,
      survey: {
        id: survey._id,
        code: survey.code,
        title: survey.title,
        totalResponses: survey.responses.length,
        stats,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   DELETE /api/surveys/:id
// @desc    Delete a survey (teachers only)
// @access  Private/Teacher
router.delete('/:id', protect, isTeacher, async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    if (survey.createdBy.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this survey' });
    }

    await Survey.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Survey deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;