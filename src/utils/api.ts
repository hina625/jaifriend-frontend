import axios from 'axios';

// Simple API URL configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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
  console.log('API URL:', `${API_URL}/auth/setup`);
  console.log('Token:', token);
  console.log('Data:', data);
  
  const res = await axios.post(
    `${API_URL}/auth/setup`,
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
  const res = await axios.get(`${API_URL}/albums/user`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const createAlbumApi = async (token: string, albumData: FormData) => {
  const res = await axios.post(`${API_URL}/albums`, albumData, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });
  return res.data;
};

export const deleteAlbumApi = async (token: string, albumId: string) => {
  const res = await axios.delete(`${API_URL}/albums/${albumId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const editAlbumApi = async (token: string, albumId: string, albumData: FormData) => {
  const res = await axios.put(`${API_URL}/albums/${albumId}`, albumData, {
    headers: { 
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    }
  });
  return res.data;
};

// Additional album interaction APIs
export const likeAlbumApi = async (token: string, albumId: string) => {
  const res = await axios.post(`${API_URL}/albums/${albumId}/like`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const shareAlbumApi = async (token: string, albumId: string) => {
  const res = await axios.post(`${API_URL}/albums/${albumId}/share`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const saveAlbumApi = async (token: string, albumId: string) => {
  const res = await axios.post(`${API_URL}/albums/${albumId}/save`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const addCommentApi = async (token: string, albumId: string, comment: string) => {
  const res = await axios.post(`${API_URL}/albums/${albumId}/comment`, { text: comment }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const deleteCommentApi = async (token: string, albumId: string, commentId: string) => {
  const res = await axios.delete(`${API_URL}/albums/${albumId}/comment/${commentId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getSavedAlbumsApi = async (token: string) => {
  const res = await axios.get(`${API_URL}/albums/saved`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getAllAlbumsApi = async () => {
  const res = await axios.get(`${API_URL}/albums`);
  return res.data;
};
