// Quick test to verify models load correctly
const mongoose = require('mongoose');
const { User, Place, Review, Favorite } = require('../models');

describe('Model Loading', () => {
  test('User model should be defined', () => {
    expect(User).toBeDefined();
    expect(User.modelName).toBe('User');
  });

  test('Place model should be defined', () => {
    expect(Place).toBeDefined();
    expect(Place.modelName).toBe('Place');
  });

  test('Review model should be defined', () => {
    expect(Review).toBeDefined();
    expect(Review.modelName).toBe('Review');
  });

  test('Favorite model should be defined', () => {
    expect(Favorite).toBeDefined();
    expect(Favorite.modelName).toBe('Favorite');
  });
});
