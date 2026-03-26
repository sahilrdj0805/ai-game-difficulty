const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
  score: {
    type: Number,
    required: true,
    default: 0
  },
  reactionTime: {
    type: Number,
    required: true,
    default: 1000 // milliseconds
  },
  mistakes: {
    type: Number,
    required: true,
    default: 0
  },
  speed: {
    type: Number,
    required: true,
    default: 1
  },
  difficulty: {
    type: String,
    enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ELITE'],
    default: 'BEGINNER'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Player', PlayerSchema);