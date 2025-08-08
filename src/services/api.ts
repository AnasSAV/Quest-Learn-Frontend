import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface Assignment {
  id: string;
  questionImage: string;
  correctAnswer: string;
  createdAt: string;
}

export interface StudentSubmission {
  id: string;
  assignmentId: string;
  studentAnswer: string;
  isCorrect: boolean;
  submittedAt: string;
}

export interface StudentPerformance {
  studentId: string;
  studentName: string;
  submissions: StudentSubmission[];
  accuracy: number;
}

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
  email: string;
  password: string;
}

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && token !== 'demo-token') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Authentication APIs
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    const token = localStorage.getItem('token');
    if (token && token !== 'demo-token') {
      try {
        await apiClient.post('/auth/logout');
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    localStorage.clear();
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
      const decodedToken = api.decodeToken(token);
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
      return api.decodeToken(token);
    } catch (error) {
      return null;
    }
  },

  // Teacher APIs
  uploadAssignment: async (questionImage: File, correctAnswer: string): Promise<Assignment> => {
    const formData = new FormData();
    formData.append('questionImage', questionImage);
    formData.append('correctAnswer', correctAnswer);
    
    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAssignments: async (): Promise<Assignment[]> => {
    const response = await apiClient.get('/assignments');
    return response.data;
  },

  getStudentPerformance: async (): Promise<StudentPerformance[]> => {
    const response = await apiClient.get('/performance');
    return response.data;
  },

  // Student APIs
  submitAnswer: async (assignmentId: string, answer: string): Promise<{ isCorrect: boolean; correctAnswer?: string }> => {
    const response = await apiClient.post('/submitAnswer', {
      assignmentId,
      answer,
    });
    return response.data;
  },
};