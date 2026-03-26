const express = require('express');
require('dotenv').config();

// Import configurations
const corsMiddleware = require('./config/cors');
const connectDB = require('./config/database');

// Import middleware
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const playerRoutes = require('./routes/playerRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Apply middleware
app.use(corsMiddleware);
app.use(express.json());
app.use(logger);

// Routes
app.use('/api/player', playerRoutes);
app.use('/api/auth', authRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'AI Game Difficulty Engine Backend Running!' });
});

// Global error handler (must be after routes)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});