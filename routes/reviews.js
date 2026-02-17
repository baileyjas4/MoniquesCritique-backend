const express = require('express');
const router = express.Router();
const ReviewService = require('../services/ReviewService');
const { authenticate, authorizeOwnership } = require('../middleware');

/**
 * @route   GET /api/reviews/place/:placeId
 * @desc    Get reviews for a place
 * @access  Public
 */
router.get('/place/:placeId', async (req, res, next) => {
  try {
    const reviews = await ReviewService.getReviewsByPlace(req.params.placeId);
    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/reviews/user/:userId
 * @desc    Get reviews by a user
 * @access  Public
 */
router.get('/user/:userId', async (req, res, next) => {
  try {
    const reviews = await ReviewService.getReviewsByUser(req.params.userId);
    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/reviews
 * @desc    Create a new review
 * @access  Private
 */
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { placeId, rating, content, isBlogPost } = req.body;

    if (!placeId || !rating) {
      return res.status(400).json({
        error: 'Place ID and rating are required'
      });
    }

    const review = await ReviewService.createReview(
      req.user._id,
      placeId,
      rating,
      content,
      isBlogPost
    );

    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/reviews/:id
 * @desc    Update a review
 * @access  Private (owner only)
 */
router.put('/:id', authenticate, authorizeOwnership('review'), async (req, res, next) => {
  try {
    const review = await ReviewService.updateReview(req.params.id, req.body);
    res.status(200).json(review);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Delete a review
 * @access  Private (owner only)
 */
router.delete('/:id', authenticate, authorizeOwnership('review'), async (req, res, next) => {
  try {
    await ReviewService.deleteReview(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
