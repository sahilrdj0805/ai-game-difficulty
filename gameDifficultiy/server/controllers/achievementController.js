const User = require('../models/User');

// Achievement definitions
const ACHIEVEMENTS = {
  FIRST_GAME: {
    id: 'FIRST_GAME',
    name: 'First Steps',
    description: 'Play your first game',
    icon: '🎮',
    condition: (stats) => stats.totalGames >= 1
  },
  SCORE_100: {
    id: 'SCORE_100',
    name: 'Century',
    description: 'Score 100 points',
    icon: '💯',
    condition: (stats) => stats.highScore >= 100
  },
  SCORE_500: {
    id: 'SCORE_500',
    name: 'High Scorer',
    description: 'Score 500 points',
    icon: '🏆',
    condition: (stats) => stats.highScore >= 500
  },
  SCORE_1000: {
    id: 'SCORE_1000',
    name: 'Master Player',
    description: 'Score 1000 points',
    icon: '👑',
    condition: (stats) => stats.highScore >= 1000
  },
  GAMES_10: {
    id: 'GAMES_10',
    name: 'Dedicated',
    description: 'Play 10 games',
    icon: '🎯',
    condition: (stats) => stats.totalGames >= 10
  },
  GAMES_50: {
    id: 'GAMES_50',
    name: 'Veteran',
    description: 'Play 50 games',
    icon: '⭐',
    condition: (stats) => stats.totalGames >= 50
  },
  COINS_100: {
    id: 'COINS_100',
    name: 'Coin Collector',
    description: 'Collect 100 coins',
    icon: '🪙',
    condition: (stats) => stats.totalCoins >= 100
  },
  COINS_500: {
    id: 'COINS_500',
    name: 'Treasure Hunter',
    description: 'Collect 500 coins',
    icon: '💰',
    condition: (stats) => stats.totalCoins >= 500
  },
  DISTANCE_1000: {
    id: 'DISTANCE_1000',
    name: 'Long Runner',
    description: 'Run 1000 meters',
    icon: '🏃',
    condition: (stats) => stats.bestDistance >= 1000
  },
  PLAYTIME_60: {
    id: 'PLAYTIME_60',
    name: 'Time Keeper',
    description: 'Play for 60 minutes total',
    icon: '⏰',
    condition: (stats) => stats.totalPlayTime >= 3600 // 60 minutes in seconds
  }
};

// Check and unlock achievements
const checkAchievements = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return [];

    const newAchievements = [];
    const userAchievements = user.gameStats.achievements || [];

    // Check each achievement
    Object.values(ACHIEVEMENTS).forEach(achievement => {
      if (!userAchievements.includes(achievement.id) && 
          achievement.condition(user.gameStats)) {
        newAchievements.push(achievement);
        userAchievements.push(achievement.id);
      }
    });

    // Update user achievements if new ones unlocked
    if (newAchievements.length > 0) {
      user.gameStats.achievements = userAchievements;
      await user.save();
    }

    return newAchievements;

  } catch (error) {
    console.error('Achievement check error:', error);
    return [];
  }
};

// Get user achievements
const getUserAchievements = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userAchievements = user.gameStats.achievements || [];
    const unlockedAchievements = userAchievements.map(id => ACHIEVEMENTS[id]).filter(Boolean);
    const lockedAchievements = Object.values(ACHIEVEMENTS).filter(
      achievement => !userAchievements.includes(achievement.id)
    );

    res.json({
      success: true,
      achievements: {
        unlocked: unlockedAchievements,
        locked: lockedAchievements,
        total: Object.keys(ACHIEVEMENTS).length,
        unlockedCount: unlockedAchievements.length
      }
    });

  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get achievements'
    });
  }
};

// Get all achievements (for display)
const getAllAchievements = async (req, res) => {
  try {
    res.json({
      success: true,
      achievements: Object.values(ACHIEVEMENTS)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get achievements'
    });
  }
};

module.exports = {
  checkAchievements,
  getUserAchievements,
  getAllAchievements,
  ACHIEVEMENTS
};