const User = require('../models/User');
const Review = require('../models/Review');
const Favorite = require('../models/Favorite');

class UserService {
  /**
   * Get user by ID (public info only)
   * @param {string} userId - User ID
   * @returns {Object} - User object
   */
  async getUserById(userId) {
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    return user;
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} profileData - Profile data to update
   * @returns {Object} - Updated user
   */
  async updateProfile(userId, profileData) {
    // Don't allow password updates through this method
    delete profileData.password;
    delete profileData.email; // Email shouldn't be changed

    const user = await User.findByIdAndUpdate(
      userId,
      profileData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    return user;
  }

  /**
   * Change user password
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Object} - Success message
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId);
    
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      const error = new Error('Current password is incorrect');
      error.status = 401;
      throw error;
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return { message: 'Password updated successfully' };
  }

  /**
   * Delete user account
   * @param {string} userId - User ID
   * @param {string} password - Password confirmation
   * @returns {Object} - Success message
   */
  async deleteAccount(userId, password) {
    const user = await User.findById(userId);
    
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error('Password is incorrect');
      error.status = 401;
      throw error;
    }

    // Delete user's reviews
    await Review.deleteMany({ user: userId });

    // Delete user's favorites
    await Favorite.deleteMany({ user: userId });

    // Delete user account
    await User.findByIdAndDelete(userId);

    return { message: 'Account deleted successfully' };
  }

  /**
   * Get user preferences
   * @param {string} userId - User ID
   * @returns {Object} - User preferences
   */
  async getUserPreferences(userId) {
    const user = await User.findById(userId).select('preferences');
    
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    return user.preferences;
  }

  /**
   * Update user preferences
   * @param {string} userId - User ID
   * @param {Object} preferences - Preferences to update
   * @returns {Object} - Updated preferences
   */
  async updatePreferences(userId, preferences) {
    const user = await User.findByIdAndUpdate(
      userId,
      { preferences },
      { new: true, runValidators: true }
    ).select('preferences');

    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    return user.preferences;
  }

  /**
   * Get user history (reviews and favorites)
   * @param {string} userId - User ID
   * @returns {Object} - User history
   */
  async getUserHistory(userId) {
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    // Get user's reviews
    const reviews = await Review.find({ user: userId })
      .populate('place', 'name location category')
      .sort('-createdAt')
      .limit(10);

    // Get user's favorites
    const favorites = await Favorite.find({ user: userId })
      .populate('place', 'name location category averageRating')
      .sort('-createdAt');

    return {
      user: user.toJSON(),
      reviews,
      favorites: favorites.map(f => f.place)
    };
  }
}

module.exports = new UserService();
