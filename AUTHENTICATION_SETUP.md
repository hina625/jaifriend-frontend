# Authentication Setup Guide

## Overview
This guide explains the authentication system implemented in the Jaifriend application.

## Features Implemented

### 1. Token-Based Authentication
- JWT tokens for secure authentication
- Automatic token inclusion in all API requests
- Token expiration handling
- Automatic logout on token expiration

### 2. Authentication Utilities
- `auth.ts` - Centralized authentication functions
- `api.ts` - Axios instance with interceptors
- `AuthGuard.tsx` - Route protection component

### 3. Key Functions

#### Token Management
```typescript
import { getToken, setToken, removeToken, isAuthenticated } from '../utils/auth';

// Get current token
const token = getToken();

// Set token (automatically stores in localStorage)
setToken(token);

// Remove token and clear storage
removeToken();

// Check if user is authenticated
const authenticated = isAuthenticated();
```

#### API Calls
```typescript
import api from '../utils/api';

// All requests automatically include Authorization header
const response = await api.get('/profile/me');
```

#### Route Protection
```typescript
import AuthGuard from '../components/AuthGuard';

// Protect routes that require authentication
<AuthGuard requireAuth={true} redirectTo="/">
  <Dashboard />
</AuthGuard>

// Redirect authenticated users away from login page
<AuthGuard requireAuth={false} redirectTo="/dashboard">
  <LoginPage />
</AuthGuard>
```

## Testing the Authentication

### 1. Create Test User
Run the test script to create a test user:
```bash
cd my-app
node scripts/create-test-user.js
```

### 2. Test Credentials
- **Username:** testuser
- **Password:** password123

### 3. Test Flow
1. Start the backend server: `cd my-express-app && npm start`
2. Start the frontend: `cd my-app && npm run dev`
3. Go to `http://localhost:3000`
4. Login with test credentials
5. You should be redirected to `/dashboard` or `/start-up`

## File Structure

```
src/
├── utils/
│   ├── auth.ts          # Authentication utilities
│   └── api.ts           # API configuration with interceptors
├── components/
│   └── AuthGuard.tsx    # Route protection component
└── app/
    ├── page.tsx         # Login page with AuthGuard
    └── dashboard/
        └── layout.tsx   # Dashboard with AuthGuard
```

## Backend Integration

The authentication system integrates with the Express.js backend:

- **Login:** `POST /api/auth/login`
- **Register:** `POST /api/auth/register`
- **Setup Profile:** `POST /api/auth/setup`
- **Get Profile:** `GET /api/profile/me`

All protected routes use the `authMiddleware` to verify JWT tokens.

## Security Features

1. **Automatic Token Management:** Tokens are automatically included in all API requests
2. **Token Expiration:** Expired tokens are automatically removed and user is logged out
3. **Route Protection:** Unauthenticated users are redirected to login
4. **Secure Storage:** Tokens are stored in localStorage with proper cleanup

## Troubleshooting

### Common Issues

1. **"No valid auth header found"**
   - Check if user is properly logged in
   - Verify token is stored in localStorage
   - Check if token is expired

2. **Login not working**
   - Verify backend server is running
   - Check if test user exists
   - Verify API endpoints are correct

3. **Token expiration issues**
   - Check JWT_SECRET in backend environment
   - Verify token expiration time (7 days by default)

### Debug Steps

1. Check browser console for errors
2. Verify localStorage has token: `localStorage.getItem('token')`
3. Check network tab for API request/response
4. Verify backend logs for authentication middleware 