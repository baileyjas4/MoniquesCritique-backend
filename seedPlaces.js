require('dotenv').config();
const mongoose = require('mongoose');
const Place = require('./models/Place');

const samplePlaces = [
  {
    name: "The Golden Spoon",
    category: "restaurant",
    location: {
      address: "123 Main St",
      city: "New York",
      state: "NY",
      zipCode: "10001"
    },
    description: "Fine dining experience with contemporary American cuisine",
    priceRange: "$$$",
    averageRating: 4.5,
    reviewCount: 127
  },
  {
    name: "Brew & Bean Cafe",
    category: "cafe",
    location: {
      address: "456 Coffee Ave",
      city: "Seattle",
      state: "WA",
      zipCode: "98101"
    },
    description: "Cozy cafe serving artisanal coffee and fresh pastries",
    priceRange: "$$",
    averageRating: 4.7,
    reviewCount: 89
  },
  {
    name: "Sunset Lounge",
    category: "bar",
    location: {
      address: "789 Beach Blvd",
      city: "Miami",
      state: "FL",
      zipCode: "33139"
    },
    description: "Rooftop bar with stunning ocean views and craft cocktails",
    priceRange: "$$$",
    averageRating: 4.3,
    reviewCount: 156
  },
  {
    name: "Mama's Kitchen",
    category: "restaurant",
    location: {
      address: "321 Home St",
      city: "Chicago",
      state: "IL",
      zipCode: "60601"
    },
    description: "Family-style Italian restaurant with homemade pasta",
    priceRange: "$$",
    averageRating: 4.8,
    reviewCount: 203
  },
  {
    name: "Fresh Bites Bakery",
    category: "cafe",
    location: {
      address: "654 Baker Lane",
      city: "San Francisco",
      state: "CA",
      zipCode: "94102"
    },
    description: "Artisan bakery specializing in sourdough and pastries",
    priceRange: "$",
    averageRating: 4.6,
    reviewCount: 78
  },
  {
    name: "Taco Truck Express",
    category: "other",
    location: {
      address: "Various Locations",
      city: "Austin",
      state: "TX",
      zipCode: "78701"
    },
    description: "Authentic Mexican street tacos on wheels",
    priceRange: "$",
    averageRating: 4.9,
    reviewCount: 312
  },
  {
    name: "Sushi Paradise",
    category: "restaurant",
    location: {
      address: "987 Ocean Dr",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90001"
    },
    description: "Premium sushi and Japanese cuisine",
    priceRange: "$$$",
    averageRating: 4.7,
    reviewCount: 145
  },
  {
    name: "The Morning Cup",
    category: "coffee_shop",
    location: {
      address: "147 Sunrise Ave",
      city: "Portland",
      state: "OR",
      zipCode: "97201"
    },
    description: "Breakfast cafe with locally sourced ingredients",
    priceRange: "$$",
    averageRating: 4.4,
    reviewCount: 92
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing places
    await Place.deleteMany({});
    console.log('Cleared existing places');

    // Insert sample places
    await Place.insertMany(samplePlaces);
    console.log(`Inserted ${samplePlaces.length} sample places`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
