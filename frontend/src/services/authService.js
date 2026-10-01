import API from './api';

export const authService = {
  register: async (userData) => {
    // Sends POST request to backend route: /api/v1/users/register
    const response = await API.post('/users/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await API.post('/users/login', credentials);
    return response;
  },

  updateHealthProfile: async (healthData) => {
    return await API.post('/users/health-profile', healthData);
  },

  getUserProfile: async (userId) => {
    const response = await API.get(`/users/profile/${userId}`);
    return response.data;
  }
};