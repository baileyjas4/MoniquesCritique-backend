const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthService {
  /**
   * Register a new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} name - User name
   * @returns {Object} - User object and JWT token
   */
  async register(email, password, name) {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error('Email already registered');
      error.status = 400;
      throw error;
    }

    // Create new user (password will be hashed by pre-save hook)
    const user = await User.create({
      email,
      password,
      name
    });

    // Generate JWT token
    const token = this.generateToken(user._id, user.email);

    return {
      user: user.toJSON(),
      token
    };
  }

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Object} - User object and JWT token
   */
  async login(email, password) {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error('Invalid credentials');
      error.status = 401;
      throw error;
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      const error = new Error('Invalid credentials');
      error.status = 401;
      throw error;
    }

    // Generate JWT token
    const token = this.generateToken(user._id, user.email);

    return {
      user: user.toJSON(),
      token
    };
  }

  /**
   * Generate JWT token
   * @param {string} userId - User ID
   * @param {string} email - User email
   * @returns {string} - JWT token
   */
  generateToken(userId, email) {
    return jwt.sign(
      { userId, email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Object} - Decoded token payload
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      const err = new Error('Invalid or expired token');
      err.status = 401;
      throw err;
    }
  }
}

module.exports = new AuthService();
