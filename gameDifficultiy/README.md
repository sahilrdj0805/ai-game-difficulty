# 🎮 AI Game - Difficulty Adjustment Engine

A full-stack MERN gaming application with real-time AI-powered difficulty adjustment.

## 🚀 Features

- AI difficulty adjustment (Easy / Medium / Hard) based on real-time performance
- User authentication with JWT
- Global leaderboard (4 categories)
- 14 achievements
- Shop system (6 skins, 4 themes, 6 power-ups)
- 4 game modes: Endless, Time Attack, Survival, Daily Challenge
- Coin economy
- MongoDB Atlas cloud database

## 🛠️ Tech Stack

- **Frontend**: React, Axios
- **Backend**: Node.js, Express
- **Database**: MongoDB Atlas (Mongoose)
- **Auth**: JWT + bcryptjs

## 📁 Project Structure

```
├── client/       # React frontend
└── server/       # Node.js + Express backend
```

## ⚙️ Local Setup

### Backend
```bash
cd server
npm install
# Create .env file (see below)
npm start
```

### Frontend
```bash
cd client
npm install
# Create .env file (see below)
npm run dev
```

### Environment Variables

**server/.env**
```
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secret_key
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

**client/.env**
```
REACT_APP_API_URL=http://localhost:5000
```

## 🌐 Deployment (Render)

### Backend (Web Service)
- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`
- Env vars: `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`, `CLIENT_URL=<your-frontend-url>`

### Frontend (Static Site)
- Root Directory: `client`
- Build Command: `npm install && npm run build`
- Publish Directory: `build`
- Env vars: `REACT_APP_API_URL=<your-backend-url>`

## 🎮 Controls

- **A / D** — Switch lanes
- **Space** — Jump

## 📄 License

MIT
