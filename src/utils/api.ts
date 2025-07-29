import axios from 'axios';
import { getToken, removeToken } from './auth';

// ✅ Don't include `/api` here unless it's in your backend path
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// === Auth APIs ===

export const loginApi = async (data: { username: string; password: string }) => {
  const res = await api.post('/auth/login', data);
  return res.data;
};

export const setupUserApi = async (
  token: string,
  data: { avatar: string; fullName: string; bio: string; location: string }
) => {
  const res = await api.post(
    '/auth/setup',
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return res.data;
};

export default api;
