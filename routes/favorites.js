const express = require('express');
const router = express.Router();
const FavoritesService = require('../services/FavoritesService');
const { authenticate } = require('../middleware');

/**
 * @route   GET /api/favorites
 * @desc    Get user's favorite places
 * @access  Private
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const favorites = await FavoritesService.getUserFavorites(req.user._id);
    res.status(200).json(favorites);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/favorites
 * @desc    Add a place to favorites
 * @access  Private
 */
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { placeId } = req.body;

    if (!placeId) {
      return res.status(400).json({
        error: 'Place ID is required'
      });
    }

    const favorite = await FavoritesService.addFavorite(req.user._id, placeId);
    res.status(201).json(favorite);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/favorites/:placeId
 * @desc    Remove a place from favorites
 * @access  Private
 */
router.delete('/:placeId', authenticate, async (req, res, next) => {
  try {
    await FavoritesService.removeFavorite(req.user._id, req.params.placeId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/favorites/check/:placeId
 * @desc    Check if a place is favorited
 * @access  Private
 */
router.get('/check/:placeId', authenticate, async (req, res, next) => {
  try {
    const isFavorite = await FavoritesService.isFavorite(req.user._id, req.params.placeId);
    res.status(200).json({ isFavorite });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
