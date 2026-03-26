import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Token stored in sessionStorage so it survives page refreshes within the same tab
let _memToken = sessionStorage.getItem('token') || null;

// Create axios instance with default config
const authAPI = axios.create({
  baseURL: `${API_URL}/api/auth`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests from memory, never from localStorage
authAPI.interceptors.request.use((config) => {
  if (_memToken) {
    config.headers.Authorization = `Bearer ${_memToken}`;
  }
  return config;
});

// Authentication functions
export const authService = {
  // Register new user
  register: async (userData) => {
    const response = await authAPI.post('/register', userData);
    if (response.data.token) {
      _memToken = response.data.token;
      sessionStorage.setItem('token', response.data.token);
      sessionStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await authAPI.post('/login', credentials);
    if (response.data.token) {
      _memToken = response.data.token;
      sessionStorage.setItem('token', response.data.token);
      sessionStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Logout user
  logout: () => {
    _memToken = null;
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: () => {
    const user = sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is logged in
  isAuthenticated: () => {
    return _memToken !== null || sessionStorage.getItem('token') !== null;
  },

  // Get user profile
  getProfile: async () => {
    const response = await authAPI.get('/profile');
    return response.data;
  },

  // Update game stats
  updateGameStats: async (stats) => {
    const response = await authAPI.put('/stats', stats);
    return response.data;
  },

  // Get leaderboard
  getLeaderboard: async (type = 'highScore', limit = 10) => {
    const response = await authAPI.get(`/leaderboard?type=${type}&limit=${limit}`);
    return response.data;
  },

  // Get user achievements
  getUserAchievements: async () => {
    const response = await authAPI.get('/achievements');
    return response.data;
  },

  // Get all achievements
  getAllAchievements: async () => {
    const response = await authAPI.get('/achievements/all');
    return response.data;
  }
};