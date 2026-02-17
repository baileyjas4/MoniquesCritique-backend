const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
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
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  content: {
    type: String,
    trim: true
  },
  isBlogPost: {
    type: Boolean,
    default: false
  },
  images: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
reviewSchema.index({ user: 1 }); // Index for user's reviews
reviewSchema.index({ place: 1 }); // Index for place's reviews
reviewSchema.index({ user: 1, place: 1 }); // Compound index for checking existing reviews

// Update the updatedAt timestamp before saving
reviewSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

// Temporarily disable post-save hooks to debug
// Post-save hook to trigger place rating recalculation
// reviewSchema.post('save', async function(doc) {
//   try {
//     await updatePlaceRating(doc.place);
//   } catch (error) {
//     console.error('Error in post-save hook:', error);
//     // Don't throw error to prevent review creation from failing
//   }
// });

// Post-remove hook to trigger place rating recalculation
// reviewSchema.post('findOneAndDelete', async function(doc) {
//   if (doc) {
//     await updatePlaceRating(doc.place);
//   }
// });

// Helper function to update place rating
async function updatePlaceRating(placeId) {
  try {
    const Place = mongoose.model('Place');
    const Review = mongoose.model('Review');
    
    // Ensure placeId is an ObjectId
    const objectId = mongoose.Types.ObjectId(placeId);
    
    // Calculate average rating from all reviews for this place
    const result = await Review.aggregate([
      { $match: { place: objectId } },
      {
        $group: {
          _id: '$place',
          averageRating: { $avg: '$rating' },
          reviewCount: { $sum: 1 }
        }
      }
    ]);

    if (result.length > 0) {
      // Update place with new average rating and review count
      await Place.findByIdAndUpdate(objectId, {
        averageRating: Math.round(result[0].averageRating * 10) / 10, // Round to 1 decimal
        reviewCount: result[0].reviewCount
      });
    } else {
      // No reviews left, reset to 0
      await Place.findByIdAndUpdate(objectId, {
        averageRating: 0,
        reviewCount: 0
      });
    }
  } catch (error) {
    console.error('Error updating place rating:', error);
    throw error; // Re-throw to see the actual error
  }
}

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
