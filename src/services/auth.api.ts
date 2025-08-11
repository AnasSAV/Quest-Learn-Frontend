import axios from 'axios';
import { apiClient } from './api.client';
import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const SUPPORTS_SERVER_LOGOUT = import.meta.env.VITE_SUPPORTS_SERVER_LOGOUT === 'true';

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface JWTPayload {
  sub: string; // User ID
  role: 'TEACHER' | 'STUDENT';
  iat: number; // Issued at
  exp: number; // Expiration time
}

export interface LoginRequest {
  user_name: string;
  password: string;
}

export const authApi = {
  // Authentication APIs
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    const token = localStorage.getItem('token');
    if (token && token !== 'demo-token' && SUPPORTS_SERVER_LOGOUT) {
      try {
        await apiClient.post('/auth/logout', {});
      } catch (error) {
        // Silently ignore server logout failures; client logout still proceeds
      }
    }
    localStorage.clear();
    // Redirect to base URL so the router can decide where to land (likely /login)
    window.location.replace('/');
  },

  // Utility function to decode JWT token
  decodeToken: (token: string): JWTPayload => {
    if (!token || typeof token !== 'string') {
      throw new Error('Invalid token: token must be a string');
    }
    
    try {
      return jwtDecode<JWTPayload>(token);
    } catch (error) {
      throw new Error('Failed to decode token: ' + (error as Error).message);
    }
  },

  // Check if token is valid (not expired and properly formatted)
  isTokenValid: (token: string): boolean => {
    if (!token || typeof token !== 'string') {
      return false;
    }
    
    // Special case for demo token
    if (token === 'demo-token') {
      return true;
    }
    
    try {
      const decodedToken = authApi.decodeToken(token);
      const currentTime = Date.now() / 1000;
      return decodedToken.exp > currentTime;
    } catch (error) {
      return false;
    }
  },

  // Get current user info from stored token
  getCurrentUser: (): JWTPayload | null => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return null;
    }
    
    // Special case for demo token
    if (token === 'demo-token') {
      const role = localStorage.getItem('userRole') as 'TEACHER' | 'STUDENT';
      const userId = localStorage.getItem('userId');
      
      if (!role || !userId) {
        return null;
      }
      
      return {
        sub: userId,
        role: role,
        iat: Date.now() / 1000,
        exp: Date.now() / 1000 + (24 * 60 * 60) // 24 hours from now
      };
    }
    
    try {
      return authApi.decodeToken(token);
    } catch (error) {
      return null;
    }
  },
};
