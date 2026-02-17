require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const app = express();

// Connect to MongoDB
connectDB();

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const placeRoutes = require('./routes/places');
const reviewRoutes = require('./routes/reviews');
const favoriteRoutes = require('./routes/favorites');
const recommendationRoutes = require('./routes/recommendations');
const externalRoutes = require('./routes/external');
const uploadRoutes = require('./routes/upload');
const errorHandler = require('./middleware/errorHandler');

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Monique\'s Critique API',
    status: 'healthy',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/places', placeRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/external', externalRoutes);
app.use('/api/upload', uploadRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

module.exports = app;
