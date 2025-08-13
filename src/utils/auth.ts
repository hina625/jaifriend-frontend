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
 * Get the current authentication token from localStorage
 * @returns The token or null if not found
 */
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

/**
 * Set the authentication token in localStorage
 * @param token The authentication token
 */
export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
};

/**
 * Remove the authentication token from localStorage
 */
export const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
};

/**
 * Logout function that clears all authentication data
 */
export const logout = (): void => {
  if (typeof window === 'undefined') return;
  clearAuth();
  // Optionally redirect to login page
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
};

/**
 * Get user information from the JWT token
 * @returns The decoded token payload or null if invalid
 */
export const getUserFromToken = (): any => {
  const token = getToken();
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    console.error('Error parsing token:', error);
    removeToken();
    return null;
  }
};

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
  
  // Check if token exists and is valid
  if (!token || token === 'null' || token === 'undefined') {
    return false;
  }
  
  // If we have a token, consider the user authenticated
  // User data might be populated later
  return true;
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