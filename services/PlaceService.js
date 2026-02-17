const Place = require('../models/Place');

class PlaceService {
  /**
   * Search places with filters and sorting
   * @param {Object} query - Search query parameters
   * @returns {Array} - Array of places
   */
  async searchPlaces(query = {}) {
    const { name, location, category, priceRange, sort = '-averageRating' } = query;
    
    // Build filter object
    const filter = {};

    // Text search by name
    if (name) {
      filter.$text = { $search: name };
    }

    // Filter by location (city)
    if (location) {
      filter['location.city'] = new RegExp(location, 'i');
    }

    // Filter by category
    if (category) {
      filter.category = category;
    }

    // Filter by price range
    if (priceRange) {
      filter.priceRange = priceRange;
    }

    // Execute query with sorting
    const places = await Place.find(filter).sort(sort);

    return places;
  }

  /**
   * Get place by ID
   * @param {string} placeId - Place ID
   * @returns {Object} - Place object
   */
  async getPlaceById(placeId) {
    const place = await Place.findById(placeId);
    
    if (!place) {
      const error = new Error('Place not found');
      error.status = 404;
      throw error;
    }

    return place;
  }

  /**
   * Get place by external ID (Foursquare ID)
   * @param {string} externalId - External place ID
   * @returns {Object} - Place object or null
   */
  async getPlaceByExternalId(externalId) {
    const place = await Place.findOne({ externalId });
    return place;
  }

  /**
   * Create a new place
   * @param {Object} placeData - Place data
   * @returns {Object} - Created place
   */
  async createPlace(placeData) {
    const place = await Place.create(placeData);
    return place;
  }

  /**
   * Update a place
   * @param {string} placeId - Place ID
   * @param {Object} updates - Updates to apply
   * @returns {Object} - Updated place
   */
  async updatePlace(placeId, updates) {
    const place = await Place.findByIdAndUpdate(
      placeId,
      updates,
      { new: true, runValidators: true }
    );

    if (!place) {
      const error = new Error('Place not found');
      error.status = 404;
      throw error;
    }

    return place;
  }

  /**
   * Delete a place
   * @param {string} placeId - Place ID
   * @returns {Object} - Deleted place
   */
  async deletePlace(placeId) {
    const place = await Place.findByIdAndDelete(placeId);

    if (!place) {
      const error = new Error('Place not found');
      error.status = 404;
      throw error;
    }

    return place;
  }

  /**
   * Get places by category
   * @param {string} category - Category name
   * @returns {Array} - Array of places
   */
  async getPlacesByCategory(category) {
    return await Place.find({ category }).sort('-averageRating');
  }

  /**
   * Get places by location
   * @param {string} city - City name
   * @returns {Array} - Array of places
   */
  async getPlacesByLocation(city) {
    return await Place.find({ 'location.city': new RegExp(city, 'i') }).sort('-averageRating');
  }
}

module.exports = new PlaceService();
