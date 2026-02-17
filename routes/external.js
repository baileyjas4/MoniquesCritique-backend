const express = require('express');
const router = express.Router();
const YelpService = require('../services/YelpService');
const PlaceService = require('../services/PlaceService');

/**
 * @route   GET /api/external/search
 * @desc    Search for places using Yelp API
 * @access  Public
 */
router.get('/search', async (req, res, next) => {
  try {
    const { query, location, category, limit } = req.query;
    
    const places = await YelpService.searchPlaces({
      query,
      location,
      categories: category,
      limit: limit || 20
    });

    res.status(200).json(places);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/external/details/:yelpId
 * @desc    Get place details from Yelp
 * @access  Public
 */
router.get('/details/:yelpId', async (req, res, next) => {
  try {
    const { yelpId } = req.params;
    
    // Get place details from Yelp
    const placeData = await YelpService.getPlaceDetails(yelpId);
    
    res.status(200).json(placeData);
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/external/import/:yelpId
 * @desc    Import a place from Yelp to our database
 * @access  Public
 */
router.post('/import/:yelpId', async (req, res, next) => {
  try {
    const { yelpId } = req.params;
    
    // Check if place already exists
    const existingPlace = await PlaceService.getPlaceByExternalId(yelpId);
    if (existingPlace) {
      return res.status(200).json(existingPlace);
    }

    // Get place details from Yelp
    const placeData = await YelpService.getPlaceDetails(yelpId);
    
    // Create place in our database
    const place = await PlaceService.createPlace(placeData);
    
    res.status(201).json(place);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
