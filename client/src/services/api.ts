import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Interceptor to inject active user ID
api.interceptors.request.use((config) => {
  const activeUserId = localStorage.getItem('promptcanvas_user_id') || 'u-101';
  config.headers['x-user-id'] = activeUserId;
  config.headers['Authorization'] = `Bearer ${activeUserId}`;
  return config;
});

// Response error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);
