const User = require('../models/User');

// Get global leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const { type = 'highScore', limit = 10 } = req.query;
    
    let sortField;
    switch (type) {
      case 'highScore':
        sortField = { 'gameStats.highScore': -1 };
        break;
      case 'totalGames':
        sortField = { 'gameStats.totalGames': -1 };
        break;
      case 'bestDistance':
        sortField = { 'gameStats.bestDistance': -1 };
        break;
      case 'totalCoins':
        sortField = { 'gameStats.totalCoins': -1 };
        break;
      default:
        sortField = { 'gameStats.highScore': -1 };
    }

    const leaderboard = await User.find()
      .select('username gameStats createdAt')
      .sort(sortField)
      .limit(parseInt(limit));

    // Add rank to each user
    const rankedLeaderboard = leaderboard.map((user, index) => ({
      rank: index + 1,
      username: user.username,
      gameStats: user.gameStats,
      joinedAt: user.createdAt
    }));

    res.json({
      success: true,
      leaderboard: rankedLeaderboard,
      type: type
    });

  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get leaderboard'
    });
  }
};

// Get user rank
const getUserRank = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type = 'highScore' } = req.query;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let sortField, userValue;
    switch (type) {
      case 'highScore':
        sortField = { 'gameStats.highScore': -1 };
        userValue = user.gameStats.highScore;
        break;
      case 'totalGames':
        sortField = { 'gameStats.totalGames': -1 };
        userValue = user.gameStats.totalGames;
        break;
      case 'bestDistance':
        sortField = { 'gameStats.bestDistance': -1 };
        userValue = user.gameStats.bestDistance;
        break;
      case 'totalCoins':
        sortField = { 'gameStats.totalCoins': -1 };
        userValue = user.gameStats.totalCoins;
        break;
      default:
        sortField = { 'gameStats.highScore': -1 };
        userValue = user.gameStats.highScore;
    }

    // Count users with better stats
    const betterUsersCount = await User.countDocuments({
      [`gameStats.${type}`]: { $gt: userValue }
    });

    const rank = betterUsersCount + 1;
    const totalUsers = await User.countDocuments();

    res.json({
      success: true,
      userRank: {
        rank: rank,
        totalUsers: totalUsers,
        username: user.username,
        value: userValue,
        type: type
      }
    });

  } catch (error) {
    console.error('User rank error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user rank'
    });
  }
};

module.exports = {
  getLeaderboard,
  getUserRank
};