const Favorite = require('../models/Favorite');
const Place = require('../models/Place');

class FavoritesService {
  /**
   * Add a place to user's favorites
   * @param {string} userId - User ID
   * @param {string} placeId - Place ID
   * @returns {Object} - Created favorite
   */
  async addFavorite(userId, placeId) {
    // Verify place exists
    const place = await Place.findById(placeId);
    if (!place) {
      const error = new Error('Place not found');
      error.status = 404;
      throw error;
    }

    // Check if already favorited
    const existing = await Favorite.findOne({ user: userId, place: placeId });
    if (existing) {
      const error = new Error('Place already in favorites');
      error.status = 400;
      throw error;
    }

    // Create favorite
    const favorite = await Favorite.create({
      user: userId,
      place: placeId
    });

    await favorite.populate('place');
    return favorite;
  }

  /**
   * Remove a place from user's favorites
   * @param {string} userId - User ID
   * @param {string} placeId - Place ID
   * @returns {Object} - Deleted favorite
   */
  async removeFavorite(userId, placeId) {
    const favorite = await Favorite.findOneAndDelete({
      user: userId,
      place: placeId
    });

    if (!favorite) {
      const error = new Error('Favorite not found');
      error.status = 404;
      throw error;
    }

    return favorite;
  }

  /**
   * Get all user's favorite places
   * @param {string} userId - User ID
   * @returns {Array} - Array of favorite places
   */
  async getUserFavorites(userId) {
    const favorites = await Favorite.find({ user: userId })
      .populate('place')
      .sort('-createdAt');

    return favorites.map(f => f.place);
  }

  /**
   * Check if a place is favorited by user
   * @param {string} userId - User ID
   * @param {string} placeId - Place ID
   * @returns {boolean} - True if favorited
   */
  async isFavorite(userId, placeId) {
    const favorite = await Favorite.findOne({ user: userId, place: placeId });
    return !!favorite;
  }
}

module.exports = new FavoritesService();
