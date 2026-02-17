const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  place: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Place',
    required: [true, 'Place reference is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound unique index to prevent duplicate favorites
favoriteSchema.index({ user: 1, place: 1 }, { unique: true });

// Index for retrieving user's favorites
favoriteSchema.index({ user: 1 });

const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;
