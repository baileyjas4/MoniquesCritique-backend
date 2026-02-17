const User = require('../models/User');
const Place = require('../models/Place');
const Review = require('../models/Review');

class AIRecommendationService {
  /**
   * Get personalized recommendations for a user
   * @param {string} userId - User ID
   * @param {number} limit - Number of recommendations
   * @returns {Array} - Array of recommended places with explanations
   */
  async getRecommendations(userId, limit = 5) {
    const user = await User.findById(userId);
    
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    // Get user's review history
    const userReviews = await Review.find({ user: userId }).populate('place');
    
    // If user has reviews, analyze their taste
    if (userReviews.length > 0) {
      return await this.getPersonalizedRecommendations(user, userReviews, limit);
    }
    
    // For new users, return popular places in their preferred categories
    return await this.getPopularPlaces(user.preferences.categories, limit);
  }

  /**
   * Get personalized recommendations based on user history
   * @param {Object} user - User object
   * @param {Array} userReviews - User's reviews
   * @param {number} limit - Number of recommendations
   * @returns {Array} - Recommended places
   */
  async getPersonalizedRecommendations(user, userReviews, limit) {
    // Extract categories from highly-rated reviews (4+ stars)
    const likedCategories = userReviews
      .filter(r => r.rating >= 4)
      .map(r => r.place.category);

    // Get unique categories
    const preferredCategories = [...new Set([
      ...likedCategories,
      ...(user.preferences.favoriteCategories || [])
    ])];

    // Get places the user hasn't reviewed yet
    const reviewedPlaceIds = userReviews.map(r => r.place._id);
    
    const recommendations = await Place.find({
      _id: { $nin: reviewedPlaceIds },
      category: { $in: preferredCategories },
      averageRating: { $gte: 3.5 }
    })
    .sort('-averageRating -reviewCount')
    .limit(limit);

    // Add explanations and match scores
    return recommendations.map(place => ({
      place,
      explanation: this.generateExplanation(place, user, preferredCategories),
      matchScore: this.calculateMatchScore(place, user, preferredCategories)
    }));
  }

  /**
   * Get popular places for new users
   * @param {Array} categories - Preferred categories
   * @param {number} limit - Number of places
   * @returns {Array} - Popular places
   */
  async getPopularPlaces(categories = [], limit = 5) {
    const filter = categories.length > 0 
      ? { category: { $in: categories } }
      : {};

    const places = await Place.find(filter)
      .sort('-averageRating -reviewCount')
      .limit(limit);

    return places.map(place => ({
      place,
      explanation: `Popular ${place.category.replace('_', ' ')} with ${place.reviewCount} reviews and ${place.averageRating.toFixed(1)} average rating`,
      matchScore: 75 // Default score for popular places
    }));
  }

  /**
   * Calculate match score for a place
   * @param {Object} place - Place object
   * @param {Object} user - User object
   * @param {Array} preferredCategories - User's preferred categories
   * @returns {number} - Match score (0-100)
   */
  calculateMatchScore(place, user, preferredCategories) {
    let score = 0;

    // Category match (40 points)
    if (preferredCategories.includes(place.category)) {
      score += 40;
    }

    // Rating (30 points)
    if (place.averageRating >= 4.5) {
      score += 30;
    } else if (place.averageRating >= 4.0) {
      score += 25;
    } else if (place.averageRating >= 3.5) {
      score += 20;
    }

    // Price range match (20 points)
    if (user.preferences.priceRange && place.priceRange === user.preferences.priceRange) {
      score += 20;
    }

    // Popularity (10 points)
    if (place.reviewCount >= 20) {
      score += 10;
    } else if (place.reviewCount >= 10) {
      score += 7;
    } else if (place.reviewCount >= 5) {
      score += 5;
    }

    return Math.min(score, 100); // Cap at 100
  }

  /**
   * Generate explanation for recommendation
   * @param {Object} place - Place object
   * @param {Object} user - User object
   * @param {Array} preferredCategories - User's preferred categories
   * @returns {string} - Explanation text
   */
  generateExplanation(place, user, preferredCategories) {
    const reasons = [];

    if (preferredCategories.includes(place.category)) {
      reasons.push(`matches your interest in ${place.category.replace('_', ' ')}s`);
    }

    if (place.averageRating >= 4.5) {
      reasons.push('highly rated by other users');
    }

    if (place.reviewCount >= 10) {
      reasons.push('popular with many reviews');
    }

    if (user.preferences.priceRange && place.priceRange === user.preferences.priceRange) {
      reasons.push('fits your price range');
    }

    if (reasons.length === 0) {
      return 'Recommended based on your preferences';
    }

    return `Recommended because it ${reasons.join(', ')}`;
  }

  /**
   * Analyze user's taste profile
   * @param {string} userId - User ID
   * @returns {Object} - Taste profile
   */
  async analyzeUserTaste(userId) {
    const reviews = await Review.find({ user: userId }).populate('place');
    
    const categoryRatings = {};
    const priceRangeRatings = {};

    reviews.forEach(review => {
      const { category, priceRange } = review.place;
      
      if (!categoryRatings[category]) {
        categoryRatings[category] = { total: 0, count: 0 };
      }
      categoryRatings[category].total += review.rating;
      categoryRatings[category].count += 1;

      if (priceRange) {
        if (!priceRangeRatings[priceRange]) {
          priceRangeRatings[priceRange] = { total: 0, count: 0 };
        }
        priceRangeRatings[priceRange].total += review.rating;
        priceRangeRatings[priceRange].count += 1;
      }
    });

    // Calculate averages
    const favoriteCategories = Object.entries(categoryRatings)
      .map(([category, data]) => ({
        category,
        averageRating: data.total / data.count
      }))
      .sort((a, b) => b.averageRating - a.averageRating);

    return {
      totalReviews: reviews.length,
      favoriteCategories,
      priceRangePreference: Object.keys(priceRangeRatings)[0] || null
    };
  }
}

module.exports = new AIRecommendationService();
