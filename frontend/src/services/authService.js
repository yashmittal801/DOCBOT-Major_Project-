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

  logout: async () => {
    const res = await API.post('/users/logout');
    return res.data;
  },

  changePassword: async (passwordData) => {
    const res = await API.post('/users/change-password', passwordData);
    return res.data;
  },

  updateHealthProfile: async (healthData) => {
    return await API.post('/users/health-profile', healthData);
  },

  getUserProfile: async (userId) => {
    const response = await API.get(`/users/profile/${userId}`);
    return response.data;
  }
};