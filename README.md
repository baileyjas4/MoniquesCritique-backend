# Monique's Critique - Backend API

A RESTful API for a food and place review application built with Node.js, Express, and MongoDB.

## Features

- User authentication with JWT
- Secure password hashing with bcrypt
- Place search and discovery
- Review and blog post creation
- Favorites management
- AI-powered recommendations
- Ownership-based authorization

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with the following variables:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
NODE_ENV=development
```

3. Start the development server:
```bash
npm run dev
```

4. Run tests:
```bash
npm test
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and receive JWT token

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile (authenticated)
- `GET /api/users/:id/preferences` - Get user preferences (authenticated)
- `PUT /api/users/:id/preferences` - Update preferences (authenticated)

### Places
- `GET /api/places` - Search places
- `GET /api/places/:id` - Get place details
- `POST /api/places` - Create place (authenticated)
- `PUT /api/places/:id` - Update place (authenticated)
- `DELETE /api/places/:id` - Delete place (authenticated)

### Reviews
- `GET /api/reviews/place/:placeId` - Get reviews for a place
- `GET /api/reviews/user/:userId` - Get reviews by a user
- `POST /api/reviews` - Create review (authenticated)
- `PUT /api/reviews/:id` - Update review (authenticated)
- `DELETE /api/reviews/:id` - Delete review (authenticated)

### Favorites
- `GET /api/favorites` - Get user's favorites (authenticated)
- `POST /api/favorites` - Add favorite (authenticated)
- `DELETE /api/favorites/:placeId` - Remove favorite (authenticated)

### Recommendations
- `GET /api/recommendations` - Get AI recommendations (authenticated)

## Project Structure

```
backend/
├── config/          # Configuration files
├── models/          # Mongoose models
├── routes/          # API routes
├── services/        # Business logic
├── middleware/      # Custom middleware
├── tests/           # Test files
├── server.js        # Entry point
└── .env            # Environment variables
```
