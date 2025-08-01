import axios from 'axios';
import { config, getApiUrl } from './config';

// Use centralized configuration
const API_URL = config.API_URL;

export const loginApi = async (data: { username: string; password: string }) => {
  console.log('🔐 Login attempt with:', data);
  const res = await axios.post(`${API_URL}/api/auth/login`, data);
  console.log('✅ Login response:', res.data);
  return res.data;
};

export const setupUserApi = async (
  token: string,
  data: { avatar: string; fullName: string; bio: string; location: string }
) => {
  console.log('API URL:', `${API_URL}/api/auth/setup`);
  console.log('Token:', token);
  console.log('Data:', data);
  
  const res = await axios.post(
    `${API_URL}/api/auth/setup`,
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

// Album API functions
export const getUserAlbumsApi = async (token: string) => {
  const res = await axios.get(`${API_URL}/api/albums/user`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const createAlbumApi = async (token: string, albumData: FormData) => {
  const res = await axios.post(`${API_URL}/api/albums`, albumData, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });
  return res.data;
};

export const deleteAlbumApi = async (token: string, albumId: string) => {
  const res = await axios.delete(`${API_URL}/api/albums/${albumId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const editAlbumApi = async (token: string, albumId: string, albumData: FormData) => {
  const res = await axios.put(`${API_URL}/api/albums/${albumId}`, albumData, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });
  return res.data;
};

// Additional album interaction APIs
export const likeAlbumApi = async (token: string, albumId: string) => {
  const res = await axios.post(`${API_URL}/api/albums/${albumId}/like`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const shareAlbumApi = async (token: string, albumId: string) => {
  const res = await axios.post(`${API_URL}/api/albums/${albumId}/share`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const saveAlbumApi = async (token: string, albumId: string) => {
  const res = await axios.post(`${API_URL}/api/albums/${albumId}/save`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const addCommentApi = async (token: string, albumId: string, comment: string) => {
  const res = await axios.post(`${API_URL}/api/albums/${albumId}/comment`, { text: comment }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const deleteCommentApi = async (token: string, albumId: string, commentId: string) => {
  const res = await axios.delete(`${API_URL}/api/albums/${albumId}/comment/${commentId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getSavedAlbumsApi = async (token: string) => {
  const res = await axios.get(`${API_URL}/api/albums/saved`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getAllAlbumsApi = async () => {
  const res = await axios.get(`${API_URL}/api/albums`);
  return res.data;
};
