const express = require('express');
const router = express.Router();
const AIRecommendationService = require('../services/AIRecommendationService');
const { authenticate } = require('../middleware');

/**
 * @route   GET /api/recommendations
 * @desc    Get AI-powered recommendations for user
 * @access  Private
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const recommendations = await AIRecommendationService.getRecommendations(req.user._id, limit);
    res.status(200).json(recommendations);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/recommendations/taste-profile
 * @desc    Get user's taste profile analysis
 * @access  Private
 */
router.get('/taste-profile', authenticate, async (req, res, next) => {
  try {
    const tasteProfile = await AIRecommendationService.analyzeUserTaste(req.user._id);
    res.status(200).json(tasteProfile);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
