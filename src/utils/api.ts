import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const loginApi = async (data: { email: string; password: string }) => {
  console.log('🔐 Login attempt with:', data);
  const res = await axios.post(`${API_URL}/auth/login`, data);
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
