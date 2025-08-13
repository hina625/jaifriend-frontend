import axios from 'axios';
import { config, getApiUrl } from './config';

// Use centralized configuration
const API_URL = config.API_URL;

export const loginApi = async (data: { email: string; password: string }) => {
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

// Post Save API functions
export const savePostApi = async (token: string, postId: string) => {
  const res = await axios.post(`${API_URL}/api/posts/${postId}/save`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getSavedPostsApi = async (token: string, page: number = 1, limit: number = 10) => {
  const res = await axios.get(`${API_URL}/api/posts/saved?page=${page}&limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const checkPostSavedApi = async (token: string, postId: string) => {
  const res = await axios.get(`${API_URL}/api/posts/${postId}/saved-status`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

// Post management API functions
export const toggleCommentsApi = async (token: string, postId: string) => {
  const res = await axios.post(`${API_URL}/api/posts/${postId}/toggle-comments`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const pinPostApi = async (token: string, postId: string) => {
  const res = await axios.post(`${API_URL}/api/posts/${postId}/pin`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const boostPostApi = async (token: string, postId: string) => {
  const res = await axios.post(`${API_URL}/api/posts/${postId}/boost`, {}, {
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

// Explore Page APIs
export const searchUsersApi = async (token: string, query?: string) => {
  const params = query ? `?q=${encodeURIComponent(query)}` : '';
  const res = await axios.get(`${API_URL}/api/users/search${params}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getSuggestedUsersApi = async (token: string) => {
  const res = await axios.get(`${API_URL}/api/users/suggested`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const followUserApi = async (token: string, userId: string) => {
  const res = await axios.post(`${API_URL}/api/users/${userId}/follow`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getPagesApi = async (token?: string) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await axios.get(`${API_URL}/api/pages`, { headers });
  return res.data;
};

export const likePageApi = async (token: string, pageId: string) => {
  const res = await axios.post(`${API_URL}/api/pages/${pageId}/like`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getPublicGroupsApi = async (token?: string) => {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await axios.get(`${API_URL}/api/groups/public`, { headers });
  return res.data;
};

export const joinGroupApi = async (token: string, groupId: string) => {
  const res = await axios.post(`${API_URL}/api/groups/${groupId}/join`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const searchGroupsApi = async (token: string, query: string) => {
  const res = await axios.get(`${API_URL}/api/groups/search?q=${encodeURIComponent(query)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};
