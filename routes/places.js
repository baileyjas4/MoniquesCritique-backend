const express = require('express');
const router = express.Router();
const PlaceService = require('../services/PlaceService');
const { authenticate } = require('../middleware');

/**
 * @route   GET /api/places
 * @desc    Search places with filters
 * @access  Public
 */
router.get('/', async (req, res, next) => {
  try {
    const places = await PlaceService.searchPlaces(req.query);
    res.status(200).json(places);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/places/:id
 * @desc    Get place by ID
 * @access  Public
 */
router.get('/:id', async (req, res, next) => {
  try {
    const place = await PlaceService.getPlaceById(req.params.id);
    res.status(200).json(place);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/places
 * @desc    Create a new place
 * @access  Private
 */
router.post('/', authenticate, async (req, res, next) => {
  try {
    const place = await PlaceService.createPlace(req.body);
    res.status(201).json(place);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/places/:id
 * @desc    Update a place
 * @access  Private (admin only - simplified for MVP)
 */
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const place = await PlaceService.updatePlace(req.params.id, req.body);
    res.status(200).json(place);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/places/:id
 * @desc    Delete a place
 * @access  Private (admin only - simplified for MVP)
 */
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    await PlaceService.deletePlace(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
