const express = require('express');
const router = express.Router();
const UserService = require('../services/UserService');
const { authenticate, authorizeOwnership } = require('../middleware');

/**
 * @route   GET /api/users/:id
 * @desc    Get user profile (public info)
 * @access  Public
 */
router.get('/:id', async (req, res, next) => {
  try {
    const user = await UserService.getUserById(req.params.id);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/users/:id
 * @desc    Update user profile
 * @access  Private (owner only)
 */
router.put('/:id', authenticate, authorizeOwnership('user'), async (req, res, next) => {
  try {
    const user = await UserService.updateProfile(req.params.id, req.body);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/users/:id/preferences
 * @desc    Get user preferences
 * @access  Private (owner only)
 */
router.get('/:id/preferences', authenticate, authorizeOwnership('user'), async (req, res, next) => {
  try {
    const preferences = await UserService.getUserPreferences(req.params.id);
    res.status(200).json(preferences);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/users/:id/preferences
 * @desc    Update user preferences
 * @access  Private (owner only)
 */
router.put('/:id/preferences', authenticate, authorizeOwnership('user'), async (req, res, next) => {
  try {
    const preferences = await UserService.updatePreferences(req.params.id, req.body);
    res.status(200).json(preferences);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/users/:id/history
 * @desc    Get user history (reviews and favorites)
 * @access  Private (owner only)
 */
router.get('/:id/history', authenticate, authorizeOwnership('user'), async (req, res, next) => {
  try {
    const history = await UserService.getUserHistory(req.params.id);
    res.status(200).json(history);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/users/:id/password
 * @desc    Change user password
 * @access  Private (owner only)
 */
router.put('/:id/password', authenticate, authorizeOwnership('user'), async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Current password and new password are required'
      });
    }

    const result = await UserService.changePassword(req.params.id, currentPassword, newPassword);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user account
 * @access  Private (owner only)
 */
router.delete('/:id', authenticate, authorizeOwnership('user'), async (req, res, next) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        error: 'Password is required to delete account'
      });
    }

    const result = await UserService.deleteAccount(req.params.id, password);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
