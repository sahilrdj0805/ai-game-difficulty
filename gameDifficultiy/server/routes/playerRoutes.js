const express = require('express');
const router = express.Router();
const { validatePlayerData } = require('../middleware/validation');
const { 
  updatePlayerStats, 
  getPlayerStats, 
  getAllPlayers 
} = require('../controllers/playerController');

// POST /api/player/update - Update player stats and get new difficulty
router.post('/update', validatePlayerData, updatePlayerStats);

// GET /api/player/:id - Get specific player stats
router.get('/:id', getPlayerStats);

// GET /api/player - Get all players with analytics
router.get('/', getAllPlayers);

module.exports = router;