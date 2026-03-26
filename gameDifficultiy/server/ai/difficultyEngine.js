/**
 * AI Difficulty Engine
 * Reflects actual game rules:
 * - Speed: unbounded log curve  →  1 + ln(1 + distance × 0.005)
 * - Obstacles: spawn rate = 0.02 + speed × 0.008  (scales with speed)
 * - Hit penalty: speed drops 30% of gained speed, recovers in ~3s
 * - No EASY/MEDIUM/HARD labels — performance is a continuous 0-1 score
 */

class DifficultyEngine {

  /**
   * Calculate performance tier and spawn settings from live player data.
   * @param {Object} playerData - { score, reactionTime, mistakes, speed, distance, combo }
   * @returns {Object} - { difficulty, performanceScore, spawnSettings, method, confidence, ... }
   */
  static calculateDifficulty(playerData) {
    const {
      score = 0, reactionTime = 800, reactionTrend = 'STABLE',
      mistakes = 0, speed = 1, distance = 0, combo = 0,
      dominantLane = null, jumpCount = 0, moveCount = 0, recentMistakes = 0
    } = playerData;

    // ── Performance ratios ────────────────────────────────────────────────────────────
    // mirrors Game.jsx sqrt formula exactly
    const expectedSpeed   = 1 + Math.sqrt(distance * 0.0009);
    const speedRatio      = Math.min(1, (speed - 1) / Math.max(0.01, expectedSpeed - 1));
    const reactionRatio   = Math.max(0, 1 - (reactionTime / 1500));
    const mistakeRatio    = Math.max(0, 1 - (mistakes / 3));
    const comboRatio      = Math.min(1, combo / 20);
    const performanceScore = speedRatio*0.35 + reactionRatio*0.25 + mistakeRatio*0.25 + comboRatio*0.15;

    let difficulty;
    if (performanceScore < 0.30)      difficulty = 'BEGINNER';
    else if (performanceScore < 0.55) difficulty = 'INTERMEDIATE';
    else if (performanceScore < 0.75) difficulty = 'ADVANCED';
    else                              difficulty = 'ELITE';

    // ── Option 2: Reaction trend adjustment ──────────────────────────────────────────
    let reactionAdjustment = 0;
    let reactionInsight = null;
    if (reactionTrend === 'IMPROVING') {
      reactionAdjustment = +(0.008 + performanceScore * 0.006).toFixed(4);
      reactionInsight = '⚡ REACTION IMPROVING — INCREASING PRESSURE';
    } else if (reactionTrend === 'STRUGGLING') {
      reactionAdjustment = +(-0.006 - (1 - performanceScore) * 0.004).toFixed(4);
      reactionInsight = '🧠 REACTION SLOWING — EASING DIFFICULTY';
    }

    // ── Option 3: Playstyle pattern detection ─────────────────────────────────────────
    let targetLane = null;
    let patternLabel = null;
    if (dominantLane !== null) {
      targetLane = dominantLane;
      const names = ['LEFT HUGGER', 'CENTER HUGGER', 'RIGHT HUGGER'];
      patternLabel = names[dominantLane];
      reactionInsight = `🎯 AI DETECTED: ${patternLabel} — TARGETING YOUR LANE`;
    } else if (moveCount > 10 && jumpCount / moveCount > 0.5) {
      patternLabel = 'JUMPER';
      reactionInsight = '🎯 AI DETECTED: JUMPER STYLE — ADAPTING';
    }

    // ── Option 5: Fatigue detection ─────────────────────────────────────────────────────
    let fatigueEase = 0;
    const fatigued = recentMistakes >= 2;
    if (fatigued) {
      fatigueEase = -0.012;
      reactionInsight = '😴 FATIGUE DETECTED — AI REDUCING PRESSURE';
    }

    // ── Final spawn settings ────────────────────────────────────────────────────────────
    const obstacleChance = +(0.03 + speed * 0.012 + reactionAdjustment + fatigueEase).toFixed(4);
    const coinChance     = +(0.015 + speed * 0.002).toFixed(4);
    const doubleLane     = speed > 3;

    return {
      difficulty,
      performanceScore: Math.round(performanceScore * 100) / 100,
      method: 'rule-based + reaction-trend + pattern-recognition + fatigue-detection',
      confidence: Math.round((0.6 + performanceScore * 0.4) * 100) / 100,
      mlPrediction: null,
      ruleBasedDifficulty: difficulty,
      aiInsight: reactionInsight,
      patternLabel,
      fatigued,
      spawnSettings: { obstacleChance, coinChance, doubleLane, targetLane, reactionAdjustment, fatigueEase },
      speedInfo: {
        current: +speed.toFixed(2),
        expected: +expectedSpeed.toFixed(2),
        formula: '1 + ln(1 + distance × 0.005)',
        hitPenalty: '30% of gained speed, recovers in ~3s'
      }
    };
  }

  /**
   * Speed at a given distance — mirrors Game.jsx formula exactly.
   * @param {number} distance
   * @returns {number}
   */
  static speedAtDistance(distance) {
    return +(1 + Math.sqrt(distance * 0.0009)).toFixed(3);
  }

  /**
   * Speed after an obstacle hit (30% penalty on gained speed).
   * @param {number} currentSpeed
   * @returns {number}
   */
  static speedAfterHit(currentSpeed) {
    const gained  = currentSpeed - 1;
    const penalty = gained * 0.30;
    return +Math.max(1, currentSpeed - penalty).toFixed(3);
  }

  /**
   * Spawn settings at a given speed — mirrors Game.jsx tick logic.
   * @param {number} speed
   * @returns {Object}
   */
  static getDifficultySettings(speed = 1) {
    return {
      obstacleSpawnChance: +(0.03 + speed * 0.012).toFixed(4),
      coinSpawnChance:     +(0.015 + speed * 0.002).toFixed(4),
      doubleLaneBlocking:  speed > 3,
      coinMoveMultiplier:  2.5,
      obstacleMoveMultiplier: 4,
      description: `Speed ${speed.toFixed(2)}x — obstacles and coins scale continuously`
    };
  }

  /**
   * Analyze trend across recent sessions.
   * @param {Array} playerHistory
   * @returns {Object}
   */
  static analyzePlayerTrends(playerHistory) {
    if (!playerHistory || playerHistory.length === 0) {
      return { trend: 'STABLE', confidence: 0 };
    }
    const recent   = playerHistory.slice(-5);
    const avgScore = recent.reduce((s, g) => s + (g.score || 0), 0) / recent.length;
    const avgSpeed = recent.reduce((s, g) => s + (g.speed || 1), 0) / recent.length;

    if (avgSpeed > 3.5 && avgScore > 500) return { trend: 'IMPROVING', confidence: 0.85 };
    if (avgSpeed < 1.8 || avgScore < 100) return { trend: 'STRUGGLING', confidence: 0.75 };
    return { trend: 'STABLE', confidence: 0.65 };
  }

  /** Instance method — returns live model analytics */
  getMLAnalytics() {
    return { method: 'rule-based', modelTrained: false, totalSamples: 0 };
  }

  /** Instance method — behavior pattern across a player list */
  analyzePlayerBehavior(players) {
    if (!players || players.length === 0) {
      return { pattern: 'UNKNOWN', confidence: 0, trends: [] };
    }
    const avgSpeed = players.reduce((s, p) => s + (p.speed || 1), 0) / players.length;
    const avgScore = players.reduce((s, p) => s + (p.score || 0), 0) / players.length;
    const pattern  = avgSpeed > 3.5 ? 'ELITE' : avgSpeed > 2.5 ? 'SKILLED' : avgScore > 200 ? 'AVERAGE' : 'BEGINNER';
    return { pattern, confidence: 0.75, trends: [] };
  }
}

module.exports = DifficultyEngine;
