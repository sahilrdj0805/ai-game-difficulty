const Player = require('../models/Player');
const DifficultyEngine = require('../ai/difficultyEngine');

// Initialize ML-enabled difficulty engine
const difficultyEngine = new DifficultyEngine();

/**
 * Update player stats and calculate new difficulty with ML
 */
const updatePlayerStats = async (req, res) => {
  try {
    const { score, reactionTime, reactionTrend, mistakes, speed, distance, combo, dominantLane, jumpCount, moveCount, recentMistakes } = req.body;
    
    if (score === undefined || reactionTime === undefined || mistakes === undefined || speed === undefined) {
      return res.status(400).json({ error: 'Missing required fields: score, reactionTime, mistakes, speed' });
    }
    
    const difficultyAnalysis = DifficultyEngine.calculateDifficulty({
      score, reactionTime, reactionTrend, mistakes, speed,
      distance: distance || 0, combo: combo || 0,
      dominantLane: dominantLane ?? null,
      jumpCount: jumpCount || 0,
      moveCount: moveCount || 0,
      recentMistakes: recentMistakes || 0
    });

    const difficultySettings = DifficultyEngine.getDifficultySettings(speed);
    difficultySettings.reactionAdjustment = difficultyAnalysis.spawnSettings.reactionAdjustment;
    difficultySettings.targetLane         = difficultyAnalysis.spawnSettings.targetLane;
    difficultySettings.fatigueEase        = difficultyAnalysis.spawnSettings.fatigueEase;
    
    // Create new player record
    const player = new Player({
      score,
      reactionTime,
      mistakes,
      speed,
      difficulty: difficultyAnalysis.difficulty
    });
    
    await player.save();
    
    // Get ML analytics
    const mlAnalytics = difficultyEngine.getMLAnalytics();
    
    res.json({
      success: true,
      playerId: player._id,
      difficulty: difficultyAnalysis.difficulty,
      performanceScore: difficultyAnalysis.performanceScore,
      aiInsight: difficultyAnalysis.aiInsight,
      patternLabel: difficultyAnalysis.patternLabel,
      fatigued: difficultyAnalysis.fatigued,
      settings: difficultySettings,
      mlInsights: {
        method: difficultyAnalysis.method,
        confidence: difficultyAnalysis.confidence,
        spawnSettings: difficultyAnalysis.spawnSettings,
        speedInfo: difficultyAnalysis.speedInfo
      },
      analytics: mlAnalytics,
      message: `Tier: ${difficultyAnalysis.difficulty} | Pattern: ${difficultyAnalysis.patternLabel || 'NONE'} | Fatigue: ${difficultyAnalysis.fatigued}`
    });
    
  } catch (error) {
    console.error('Update player stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get player stats by ID
 */
const getPlayerStats = async (req, res) => {
  try {
    const { id } = req.params;
    
    const player = await Player.findById(id);
    
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }
    
    // Get current difficulty settings based on player speed
    const difficultySettings = DifficultyEngine.getDifficultySettings(player.speed || 1);
    
    res.json({
      player,
      settings: difficultySettings
    });
    
  } catch (error) {
    console.error('Get player stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Get all players with ML analytics
 */
const getAllPlayers = async (req, res) => {
  try {
    const players = await Player.find().sort({ createdAt: -1 }).limit(50);
    
    // Get ML behavior analysis
    const behaviorAnalysis = difficultyEngine.analyzePlayerBehavior(players);
    
    // Analyze trends
    const trends = DifficultyEngine.analyzePlayerTrends(players);
    
    res.json({
      players,
      analytics: {
        totalPlayers: players.length,
        trends,
        difficultyDistribution: {
          beginner:     players.filter(p => p.difficulty === 'BEGINNER').length,
          intermediate: players.filter(p => p.difficulty === 'INTERMEDIATE').length,
          advanced:     players.filter(p => p.difficulty === 'ADVANCED').length,
          elite:        players.filter(p => p.difficulty === 'ELITE').length
        }
      },
      mlInsights: {
        behaviorPattern: behaviorAnalysis.pattern,
        confidence: behaviorAnalysis.confidence,
        trends: behaviorAnalysis.trends,
        modelStats: difficultyEngine.getMLAnalytics()
      }
    });
    
  } catch (error) {
    console.error('Get all players error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  updatePlayerStats,
  getPlayerStats,
  getAllPlayers
};