// routes/admin.js
import express from 'express';
import User from '../models/User.js';
import { protect, isAdmin } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY || '7d',
  });
};

// @route   GET /api/admin/teachers
// @desc    Get all teachers (admin only)
// @access  Private/Admin
router.get('/teachers', protect, isAdmin, async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' }).select('-password');
    res.json({
      success: true,
      teachers,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/admin/teachers
// @desc    Create a new teacher account (admin only)
// @access  Private/Admin
router.post('/teachers', protect, isAdmin, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide name, email, and password' });
    }

    // Check if teacher already exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Create teacher
    const teacher = new User({
      name,
      email,
      password,
      role: 'teacher',
      createdBy: req.userId,
    });

    await teacher.save();

    res.status(201).json({
      success: true,
      message: 'Teacher account created successfully',
      teacher: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        role: teacher.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   DELETE /api/admin/teachers/:id
// @desc    Delete a teacher account (admin only)
// @access  Private/Admin
router.delete('/teachers/:id', protect, isAdmin, async (req, res) => {
  try {
    const teacher = await User.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    if (teacher.role !== 'teacher') {
      return res.status(400).json({ error: 'Can only delete teacher accounts' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Teacher deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   PUT /api/admin/teachers/:id
// @desc    Update teacher details (admin only)
// @access  Private/Admin
router.put('/teachers/:id', protect, isAdmin, async (req, res) => {
  try {
    const { name, email } = req.body;

    const teacher = await User.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    if (name) teacher.name = name;
    if (email) teacher.email = email;

    await teacher.save();

    res.json({
      success: true,
      message: 'Teacher updated successfully',
      teacher: {
        id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        role: teacher.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   POST /api/admin/init
// @desc    Initialize first admin (run once)
// @access  Public
router.post('/init', async (req, res) => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      return res.status(400).json({ error: 'Admin already exists' });
    }

    const { name, email, password } = req.body;

    const admin = new User({
      name: name || 'Admin',
      email: email || 'admin@surveymeter.com',
      password: password || 'admin123',
      role: 'admin',
    });

    await admin.save();
    const token = generateToken(admin._id, admin.role);

    res.status(201).json({
      success: true,
      message: 'Admin account created',
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;