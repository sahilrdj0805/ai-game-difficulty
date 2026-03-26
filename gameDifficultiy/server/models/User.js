const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 1
  },
  gameStats: {
    totalGames: { type: Number, default: 0 },
    highScore: { type: Number, default: 0 },
    totalCoins: { type: Number, default: 0 },
    bestDistance: { type: Number, default: 0 },
    totalPlayTime: { type: Number, default: 0 },
    lastGameScore: { type: Number, default: 0 },
    lastGameDistance: { type: Number, default: 0 },
    lastGameMistakes: { type: Number, default: 0 },
    maxCombo: { type: Number, default: 0 },
    achievements: [{ type: String }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);