const AuthService = require('../services/AuthService');
const User = require('../models/User');

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = AuthService.verifyToken(token);

    // Get user from database
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        error: 'User not found'
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      error: error.message || 'Authentication required'
    });
  }
};

module.exports = authenticate;
