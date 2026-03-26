import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Update player stats and get difficulty
export const updatePlayerStats = async (playerData) => {
  try {
    const response = await api.post('/player/update', playerData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default api;