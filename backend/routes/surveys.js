// routes/surveys.js - WITH EXTENSIVE DEBUG LOGGING
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
        code: survey.code,
        title: survey.title,
        questions: survey.questions,
        responses: survey.responses,
        createdAt: survey.createdAt,
        createdBy: survey.createdBy,
      },
    });
  } catch (error) {
    console.error('❌ Create Survey Error:', error);
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
    console.error('❌ Get Surveys Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/surveys/:id
// @desc    Get survey by ID or CODE (for students)
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const identifier = req.params.id;
    
    console.log('🔍 Searching for survey with identifier:', identifier);
    console.log('🔍 Type:', typeof identifier);
    console.log('🔍 Length:', identifier.length);

    let survey = null;

    // Try to find by MongoDB ObjectId first (for teachers)
    if (mongoose.Types.ObjectId.isValid(identifier) && identifier.length === 24) {
      console.log('✅ Valid ObjectId format, searching by _id...');
      survey = await Survey.findById(identifier);
      if (survey) {
        console.log('✅ Found by ID:', survey._id);
      }
    }

    // If not found by ID, try by code (for students)
    if (!survey) {
      console.log('🔍 Not found by ID, searching by code...');
      console.log('🔍 Searching with code:', identifier);
      
      // Find with detailed logging
      const allSurveys = await Survey.find({});
      console.log('📊 Total surveys in DB:', allSurveys.length);
      console.log('📊 All survey codes:', allSurveys.map(s => ({
        code: s.code,
        type: typeof s.code,
        title: s.title
      })));

      survey = await Survey.findOne({ code: identifier });
      
      if (survey) {
        console.log('✅ Found by code:', survey.code);
      } else {
        console.log('❌ Survey not found with code:', identifier);
        
        // Try case-insensitive search as fallback
        survey = await Survey.findOne({ 
          code: { $regex: new RegExp(`^${identifier}$`, 'i') } 
        });
        
        if (survey) {
          console.log('✅ Found by case-insensitive code');
        }
      }
    }

    if (!survey) {
      console.log('❌ Survey not found - ID/Code:', identifier);
      return res.status(404).json({ 
        error: 'Survey not found',
        identifier: identifier,
        message: 'Please check the survey code and try again'
      });
    }

    console.log('✅ Returning survey:', {
      id: survey._id,
      code: survey.code,
      title: survey.title,
      questions: survey.questions.length
    });

    res.json({
      success: true,
      survey,
    });
  } catch (error) {
    console.error('❌ Get Survey by ID Error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Server error while fetching survey',
      details: error.message 
    });
  }
});

// @route   POST /api/surveys/:code/submit
// @desc    Submit survey responses (students - no auth required)
// @access  Public
router.post('/:code/submit', async (req, res) => {
  try {
    console.log('📝 Submitting survey response for code:', req.params.code);
    
    const { studentName, answers } = req.body;

    const survey = await Survey.findOne({ code: req.params.code });

    if (!survey) {
      console.log('❌ Survey not found for submission:', req.params.code);
      return res.status(404).json({ error: 'Survey not found' });
    }

    if (!studentName || !answers) {
      return res.status(400).json({ error: 'Student name and answers required' });
    }

    console.log('✅ Adding response from:', studentName);

    // Add response
    survey.responses.push({
      studentName,
      answers,
      submittedAt: new Date(),
    });

    await survey.save();

    console.log('✅ Response saved successfully');

    res.json({
      success: true,
      message: 'Response submitted successfully',
    });
  } catch (error) {
    console.error('❌ Submit Survey Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /api/surveys/:id/results
// @desc    Get survey results (teachers only)
// @access  Private/Teacher
router.get('/:id/results', protect, isTeacher, async (req, res) => {
  try {
    console.log('📊 Fetching results for survey:', req.params.id);
    
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
    console.error('❌ Get Results Error:', error);
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
    console.error('❌ Delete Survey Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DEBUG ENDPOINT - Check if survey exists
router.get('/debug/all', async (req, res) => {
  try {
    const surveys = await Survey.find({}).select('code title _id');
    res.json({
      success: true,
      count: surveys.length,
      surveys: surveys.map(s => ({
        id: s._id,
        code: s.code,
        codeType: typeof s.code,
        title: s.title
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;