// Export all services from a single file
const AuthService = require('./AuthService');
const PlaceService = require('./PlaceService');
const ReviewService = require('./ReviewService');
const UserService = require('./UserService');
const FavoritesService = require('./FavoritesService');
const AIRecommendationService = require('./AIRecommendationService');

module.exports = {
  AuthService,
  PlaceService,
  ReviewService,
  UserService,
  FavoritesService,
  AIRecommendationService
};
