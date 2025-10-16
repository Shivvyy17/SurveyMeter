import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes - using relative paths from api folder
import authRoutes from '../routes/auth.js';
import surveyRoutes from '../routes/surveys.js';
import adminRoutes from '../routes/admin.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

// MongoDB Connection with caching for serverless
let isConnected = false;

async function connectToDatabase() {
  if (isConnected) {
    console.log('Using existing database connection');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
    });
    isConnected = true;
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB error:', err);
    throw err;
  }
}

// Connect before handling requests
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server running ✅',
    timestamp: new Date().toISOString(),
    mongodb: isConnected ? 'connected' : 'disconnected'
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'SurveyMeter API',
    status: 'running',
    version: '1.0.0'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    path: req.path,
    method: req.method
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: err.message || 'Something went wrong',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Export for Vercel serverless
export default app;