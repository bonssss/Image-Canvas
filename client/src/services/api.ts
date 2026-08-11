import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Interceptor to inject active user ID or JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('promptcanvas_jwt');
  const fallbackId = localStorage.getItem('promptcanvas_user_id');
  
  const authValue = token || fallbackId;
  
  if (authValue) {
    config.headers['x-user-id'] = authValue;
    config.headers['Authorization'] = `Bearer ${authValue}`;
  }
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
