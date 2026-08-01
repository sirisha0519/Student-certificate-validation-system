import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

/**
 * Middleware to protect routes. Verifies the JWT token and attaches user to the request.
 */
export const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header (format: Bearer <token>)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized, no token provided'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user details from database (excluding password)
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized, user not found'
      });
    }

    // Attach user to req object
    req.user = user;
    next();
  } catch (error) {
    console.error('JWT verification error:', error.message);
    return res.status(401).json({
      success: false,
      error: 'Not authorized, token verification failed'
    });
  }
};

/**
 * Middleware to authorize specific roles.
 * @param {...string} roles - Permitted roles (e.g., 'Admin', 'Student').
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Role (${req.user ? req.user.role : 'Guest'}) is not authorized to access this resource`
      });
    }
    next();
  };
};
