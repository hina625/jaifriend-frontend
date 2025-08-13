/**
 * Authentication utility functions
 */

export interface User {
  id?: string;
  _id?: string;
  userId?: string;
  name?: string;
  email?: string;
  avatar?: string;
}

/**
 * Get the current user ID from localStorage or token
 * @returns The user ID or null if not found
 */
export const getCurrentUserId = (): string | null => {
  const userStr = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  
  console.log('🔍 getCurrentUserId debug:');
  console.log('  - user string:', userStr);
  console.log('  - token exists:', !!token);
  
  if (userStr) {
    try {
      const user: User = JSON.parse(userStr);
      console.log('  - parsed user:', user);
      console.log('  - user.id:', user.id);
      console.log('  - user._id:', user._id);
      console.log('  - user.userId:', user.userId);
      
      // Try multiple possible user ID fields
      const userId = user.id || user._id || user.userId;
      if (userId) {
        console.log('  - Found user ID:', userId);
        return userId;
      }
    } catch (error) {
      console.error('  - JSON parse error:', error);
    }
  }
  
  // Try to get user ID from token if user data is not available
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('  - token payload:', payload);
      const tokenUserId = payload.userId || payload.id || payload.sub;
      if (tokenUserId) {
        console.log('  - Found user ID from token:', tokenUserId);
        return tokenUserId;
      }
    } catch (error) {
      console.error('  - token decode error:', error);
    }
  }
  
  console.log('  - No user ID found');
  return null;
};

/**
 * Get the current user object from localStorage
 * @returns The user object or null if not found
 */
export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Check if the user is authenticated
 * @returns True if user is authenticated, false otherwise
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

/**
 * Clear authentication data
 */
export const clearAuth = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Set authentication data
 * @param token The authentication token
 * @param user The user object
 */
export const setAuth = (token: string, user: User): void => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}; 