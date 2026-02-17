const { Review, Favorite } = require('../models');

/**
 * Authorization middleware factory
 * Verifies that the authenticated user owns the resource
 * @param {string} resourceType - Type of resource (review, favorite, user)
 * @returns {Function} - Express middleware function
 */
const authorizeOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      const userId = req.user._id.toString();
      
      switch (resourceType) {
        case 'user':
          // Check if user is accessing their own profile
          if (req.params.id !== userId) {
            return res.status(403).json({
              error: 'Access denied'
            });
          }
          break;

        case 'review':
          // Check if user owns the review
          const review = await Review.findById(req.params.id);
          if (!review) {
            return res.status(404).json({
              error: 'Review not found'
            });
          }
          if (review.user.toString() !== userId) {
            return res.status(403).json({
              error: 'Access denied'
            });
          }
          req.resource = review; // Attach resource to request
          break;

        case 'favorite':
          // For favorites, we just need to ensure the user is authenticated
          // The service layer will handle user-specific operations
          break;

        default:
          return res.status(500).json({
            error: 'Invalid resource type'
          });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        error: error.message || 'Authorization failed'
      });
    }
  };
};

module.exports = authorizeOwnership;
