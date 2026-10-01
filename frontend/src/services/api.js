import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});



API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // This grabs the exact message sent by your backend (e.g., "User with this email already exists")
    const message = error.response?.data?.message || 'Server connection failed.';
    return Promise.reject(new Error(message));
  }
);

export default API;