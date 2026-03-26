const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const leaderboardController = require('../controllers/leaderboardController');
const achievementController = require('../controllers/achievementController');
const authMiddleware = require('../middleware/auth');

// Authentication routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/stats', authMiddleware, authController.updateGameStats);

// Leaderboard routes
router.get('/leaderboard', leaderboardController.getLeaderboard);
router.get('/leaderboard/user/:userId', leaderboardController.getUserRank);

// Achievement routes
router.get('/achievements', authMiddleware, achievementController.getUserAchievements);
router.get('/achievements/all', achievementController.getAllAchievements);

module.exports = router;