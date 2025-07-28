import axios from 'axios';
import { getToken, removeToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      removeToken();
      
      // Redirect to login page if not already there
      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export const loginApi = async (data: { username: string; password: string }) => {
  console.log('🔐 Login attempt with:', data);
  const res = await api.post('/auth/login', data);
  console.log('✅ Login response:', res.data);
  return res.data;
};

export const setupUserApi = async (
  token: string,
  data: { avatar: string; fullName: string; bio: string; location: string }
) => {
  console.log('API URL:', `${API_URL}/auth/setup`);
  console.log('Token:', token);
  console.log('Data:', data);
  
  const res = await api.post(
    '/auth/setup',
    data,
    { 
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      } 
    }
  );
  return res.data;
};

// Export the api instance for other components to use
export default api;
