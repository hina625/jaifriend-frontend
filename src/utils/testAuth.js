// Test script for authentication debugging
// Run this in the browser console to test the auth flow

export const testAuthFlow = async () => {
  console.log('🧪 Starting authentication flow test...');
  
  // Step 1: Check if token exists
  const existingToken = localStorage.getItem('token');
  console.log('1. Existing token:', existingToken ? 'Present' : 'None');
  
  // Step 2: Test login API
  try {
    console.log('2. Testing login API...');
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'testuser', // Replace with actual test credentials
        password: 'testpass'
      })
    });
    
    const data = await response.json();
    console.log('Login response:', data);
    
    if (data.token) {
      console.log('3. Token received, storing...');
      localStorage.setItem('token', data.token);
      
      // Step 4: Test token retrieval
      const storedToken = localStorage.getItem('token');
      console.log('4. Stored token:', storedToken ? 'Success' : 'Failed');
      
      // Step 5: Test authenticated request
      console.log('5. Testing authenticated request...');
      const authResponse = await fetch('http://localhost:5000/api/albums/user', {
        headers: {
          'Authorization': `Bearer ${storedToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Auth response status:', authResponse.status);
      if (authResponse.ok) {
        const albumsData = await authResponse.json();
        console.log('6. ✅ Authentication successful! Albums:', albumsData);
      } else {
        const error = await authResponse.json();
        console.log('6. ❌ Authentication failed:', error);
      }
    } else {
      console.log('3. ❌ No token in response');
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Function to clear all auth data
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userEmail');
  console.log('🧹 Auth data cleared');
};

// Function to check current auth state
export const checkAuthState = () => {
  const token = localStorage.getItem('token');
  const userEmail = localStorage.getItem('userEmail');
  
  console.log('🔍 Current auth state:');
  console.log('- Token:', token ? 'Present' : 'None');
  console.log('- User email:', userEmail || 'None');
  
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('- Token payload:', payload);
      console.log('- Expires:', new Date(payload.exp * 1000).toLocaleString());
    } catch (error) {
      console.log('- Token decode error:', error.message);
    }
  }
};

// Make functions available globally
if (typeof window !== 'undefined') {
  (window as any).testAuthFlow = testAuthFlow;
  (window as any).clearAuthData = clearAuthData;
  (window as any).checkAuthState = checkAuthState;
} 