// Export all models from a single file for easier imports
const User = require('./User');
const Place = require('./Place');
const Review = require('./Review');
const Favorite = require('./Favorite');

module.exports = {
  User,
  Place,
  Review,
  Favorite
};
