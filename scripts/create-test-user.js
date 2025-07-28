const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    const response = await axios.post(`${API_URL}/auth/register`, {
      name: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
    
    console.log('✅ Test user created successfully!');
    console.log('Username: testuser');
    console.log('Password: password123');
    console.log('Token:', response.data.token);
    
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message === 'User already exists') {
      console.log('ℹ️ Test user already exists');
      console.log('Username: testuser');
      console.log('Password: password123');
    } else {
      console.error('❌ Error creating test user:', error.response?.data || error.message);
    }
  }
}

createTestUser(); 