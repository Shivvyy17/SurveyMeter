// middleware/auth.js
import jwt from 'jsonwebtoken';

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Only admins can access this' });
  }
  next();
};

export const isTeacher = (req, res, next) => {
  if (req.userRole !== 'teacher' && req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Only teachers can access this' });
  }
  next();
};