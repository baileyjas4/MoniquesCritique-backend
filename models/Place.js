const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
  externalId: {
    type: String,
    unique: true,
    sparse: true // Allows null values while maintaining uniqueness for non-null values
  },
  name: {
    type: String,
    required: [true, 'Place name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['restaurant', 'coffee_shop', 'bar', 'cafe', 'other'],
      message: '{VALUE} is not a valid category'
    }
  },
  location: {
    address: {
      type: String,
      required: [true, 'Address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String
    },
    zipCode: {
      type: String
    },
    coordinates: {
      lat: {
        type: Number
      },
      lng: {
        type: Number
      }
    }
  },
  description: {
    type: String,
    trim: true
  },
  priceRange: {
    type: String,
    enum: {
      values: ['$', '$$', '$$$', ''],
      message: '{VALUE} is not a valid price range'
    },
    default: ''
  },
  averageRating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be more than 5']
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: [0, 'Review count cannot be negative']
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

// Indexes for search and filtering
placeSchema.index({ name: 'text' }); // Text index for name search
placeSchema.index({ category: 1 }); // Index for category filtering
placeSchema.index({ 'location.city': 1 }); // Index for location-based queries
placeSchema.index({ averageRating: -1 }); // Index for sorting by rating

// Update the updatedAt timestamp before saving
placeSchema.pre('save', async function() {
  this.updatedAt = Date.now();
});

const Place = mongoose.model('Place', placeSchema);

module.exports = Place;
