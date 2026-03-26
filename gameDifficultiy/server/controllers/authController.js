const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '7d'
  });
};

// Register new user
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or username'
      });
    }

    // Create new user
    const user = new User({ username, email, password });
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        gameStats: user.gameStats
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        gameStats: user.gameStats
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        gameStats: user.gameStats,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile'
    });
  }
};

// Update game stats
const updateGameStats = async (req, res) => {
  try {
    const { 
      gamesPlayed, 
      highScore, 
      totalCoins, 
      bestDistance, 
      totalPlayTime, 
      lastGameScore, 
      lastGameDistance, 
      lastGameMistakes, 
      maxCombo 
    } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update stats with new values
    if (gamesPlayed !== undefined) user.gameStats.totalGames = gamesPlayed;
    if (totalCoins !== undefined) user.gameStats.totalCoins = totalCoins;
    if (totalPlayTime !== undefined) user.gameStats.totalPlayTime = totalPlayTime;
    
    if (highScore !== undefined && highScore > user.gameStats.highScore) {
      user.gameStats.highScore = highScore;
    }
    
    if (bestDistance !== undefined && bestDistance > user.gameStats.bestDistance) {
      user.gameStats.bestDistance = bestDistance;
    }

    // Always update last game stats (use explicit undefined check, not falsy)
    if (lastGameScore    !== undefined) user.gameStats.lastGameScore    = lastGameScore;
    if (lastGameDistance !== undefined) user.gameStats.lastGameDistance = lastGameDistance;
    if (lastGameMistakes !== undefined) user.gameStats.lastGameMistakes = lastGameMistakes;
    if (maxCombo !== undefined && maxCombo > user.gameStats.maxCombo) {
      user.gameStats.maxCombo = maxCombo;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Game stats updated successfully',
      gameStats: user.gameStats
    });

  } catch (error) {
    console.error('Update stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stats',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateGameStats
};