const Review = require('../models/Review');
const Place = require('../models/Place');
const User = require('../models/User');

class ReviewService {
  /**
   * Create a new review
   * @param {string} userId - User ID
   * @param {string} placeId - Place ID
   * @param {number} rating - Rating (1-5)
   * @param {string} content - Review content
   * @param {boolean} isBlogPost - Is this a blog post
   * @returns {Object} - Created review
   */
  async createReview(userId, placeId, rating, content, isBlogPost = false) {
    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    // Verify place exists
    const place = await Place.findById(placeId);
    if (!place) {
      const error = new Error('Place not found');
      error.status = 404;
      throw error;
    }

    // Create review
    const review = await Review.create({
      user: userId,
      place: placeId,
      rating,
      content,
      isBlogPost
    });

    // Manually update place rating
    await this.updatePlaceRating(placeId);

    // Populate user and place info
    await review.populate('user', 'name email profilePicture');
    await review.populate('place', 'name location');

    return review;
  }

  /**
   * Update place rating based on all reviews
   * @param {string} placeId - Place ID
   */
  async updatePlaceRating(placeId) {
    try {
      // Calculate average rating from all reviews for this place
      const reviews = await Review.find({ place: placeId });
      
      if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviews.length;
        
        // Update place with new average rating and review count
        await Place.findByIdAndUpdate(placeId, {
          averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
          reviewCount: reviews.length
        });
      } else {
        // No reviews left, reset to 0
        await Place.findByIdAndUpdate(placeId, {
          averageRating: 0,
          reviewCount: 0
        });
      }
    } catch (error) {
      console.error('Error updating place rating:', error);
      // Don't throw error to prevent review operations from failing
    }
  }

  /**
   * Update a review
   * @param {string} reviewId - Review ID
   * @param {Object} updates - Updates to apply
   * @returns {Object} - Updated review
   */
  async updateReview(reviewId, updates) {
    const review = await Review.findByIdAndUpdate(
      reviewId,
      updates,
      { new: true, runValidators: true }
    ).populate('user', 'name email profilePicture').populate('place', 'name location');

    if (!review) {
      const error = new Error('Review not found');
      error.status = 404;
      throw error;
    }

    return review;
  }

  /**
   * Delete a review
   * @param {string} reviewId - Review ID
   * @returns {Object} - Deleted review
   */
  async deleteReview(reviewId) {
    const review = await Review.findByIdAndDelete(reviewId);

    if (!review) {
      const error = new Error('Review not found');
      error.status = 404;
      throw error;
    }

    // Update place rating after deletion
    await this.updatePlaceRating(review.place);

    return review;
  }

  /**
   * Get reviews by user
   * @param {string} userId - User ID
   * @returns {Array} - Array of reviews
   */
  async getReviewsByUser(userId) {
    return await Review.find({ user: userId })
      .populate('place', 'name location category averageRating')
      .sort('-createdAt');
  }

  /**
   * Get reviews by place
   * @param {string} placeId - Place ID
   * @returns {Array} - Array of reviews
   */
  async getReviewsByPlace(placeId) {
    return await Review.find({ place: placeId })
      .populate('user', 'name profilePicture')
      .sort('-createdAt');
  }
}

module.exports = new ReviewService();
