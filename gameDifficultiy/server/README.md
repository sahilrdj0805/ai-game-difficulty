# AI-Powered Game Difficulty Adjustment Engine - Backend

## 🎮 Project Overview
Backend for an AI-powered game that dynamically adjusts difficulty based on player performance using MERN stack.

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Setup MongoDB
- Install MongoDB locally OR use MongoDB Atlas
- Default connection: `mongodb://localhost:27017/ai-game-db`
- Update `.env` file if using different connection

### 3. Run Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server runs on: `http://localhost:5000`

## 📡 API Endpoints

### POST /api/player/update
Update player stats and get AI-calculated difficulty
```json
{
  "score": 750,
  "reactionTime": 650,
  "mistakes": 2,
  "speed": 1.2
}
```

### GET /api/player/:id
Get specific player stats

### GET /api/player
Get all players with analytics

## 🤖 AI Difficulty Engine

### Logic Rules:
- **EASY**: Low performance (score < 300, high mistakes)
- **MEDIUM**: Average performance 
- **HARD**: High performance (score > 700, fast reactions)

### Difficulty Effects:
- **EASY**: 0.5x speed, 5 lives
- **MEDIUM**: 1.0x speed, 3 lives  
- **HARD**: 1.5x speed, 1 life

## 📁 Project Structure
```
server/
├── models/Player.js          # MongoDB schema
├── controllers/playerController.js  # Business logic
├── routes/playerRoutes.js    # API routes
├── ai/difficultyEngine.js    # AI algorithm
└── server.js                 # Main server file
```

## 🔮 Future Scope
- Machine Learning integration
- Reinforcement Learning
- Multiplayer support
- Advanced analytics dashboard