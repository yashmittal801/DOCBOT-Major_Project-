import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});



API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried retrying yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call backend refresh token route
        await axios.post('http://localhost:8000/api/v1/users/refresh-token', {}, {
          withCredentials: true
        });

        // Retry the original failed request
        return API(originalRequest);
      } catch (refreshError) {
        // If refresh token is also expired/invalid, bounce user to login
        localStorage.removeItem('userId');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error.response?.data || error.message);
  }
);

export default API;