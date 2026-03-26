// Game Configuration Data

export const PLAYER_SKINS = [
  { id: 'runner', emoji: '🏃♂️', name: 'Runner', price: 0, unlocked: true },
  { id: 'ninja', emoji: '🥷', name: 'Ninja', price: 500, unlocked: false },
  { id: 'robot', emoji: '🤖', name: 'Robot', price: 1000, unlocked: false },
  { id: 'superhero', emoji: '🦸', name: 'Superhero', price: 1500, unlocked: false },
  { id: 'alien', emoji: '👽', name: 'Alien', price: 2000, unlocked: false },
  { id: 'wizard', emoji: '🧙', name: 'Wizard', price: 2500, unlocked: false }
];

export const THEMES = [
  { 
    id: 'city', 
    name: 'City Night', 
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    road: '#2c2c2c',
    price: 0,
    unlocked: true
  },
  { 
    id: 'desert', 
    name: 'Desert', 
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    road: '#d4a574',
    price: 800,
    unlocked: false
  },
  { 
    id: 'snow', 
    name: 'Snow', 
    background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    road: '#e8f4f8',
    price: 1200,
    unlocked: false
  },
  { 
    id: 'space', 
    name: 'Space', 
    background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    road: '#1a1a2e',
    price: 1500,
    unlocked: false
  }
];

export const GAME_MODES = [
  {
    id: 'endless',
    name: 'Endless Mode',
    icon: '♾️',
    description: 'Play until you make 3 mistakes',
    unlocked: true
  },
  {
    id: 'timeattack',
    name: 'Time Attack',
    icon: '⏱️',
    description: 'Score maximum in 60 seconds',
    unlocked: true
  },
  {
    id: 'survival',
    name: 'Survival',
    icon: '💀',
    description: 'Extreme difficulty from start',
    unlocked: false,
    requirement: 'Score 1000+ in Endless'
  },
  {
    id: 'challenge',
    name: 'Daily Challenge',
    icon: '🎯',
    description: 'Complete daily missions',
    unlocked: true
  }
];

export const DAILY_CHALLENGES = [
  { id: 1, task: 'Collect 50 coins', reward: 100, icon: '🪙', target: 50, type: 'coins' },
  { id: 2, task: 'Reach 500 score', reward: 150, icon: '🎯', target: 500, type: 'score' },
  { id: 3, task: 'Get 10x combo', reward: 200, icon: '🔥', target: 10, type: 'combo' },
  { id: 4, task: 'Travel 1000m', reward: 250, icon: '🏃', target: 1000, type: 'distance' },
  { id: 5, task: 'Play 3 games', reward: 100, icon: '🎮', target: 3, type: 'games' }
];

export const POWER_UPS_SHOP = [
  { id: 'shield', name: 'Shield', icon: '🛡️', price: 50, description: 'Absorb one hit' },
  { id: 'magnet', name: 'Magnet', icon: '🧲', price: 75, description: 'Attract nearby coins' },
  { id: 'multiplier', name: 'Multiplier', icon: '⭐', price: 100, description: '+100 instant points' },
  { id: 'invincible', name: 'Invincible', icon: '✨', price: 150, description: '3s immunity' },
  { id: 'slowmo', name: 'Slow Motion', icon: '⏰', price: 200, description: 'Slow time for 5s' },
  { id: 'doublejump', name: 'Double Jump', icon: '🦘', price: 250, description: 'Jump twice in air' }
];

