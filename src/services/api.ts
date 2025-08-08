import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenPayload {
  sub: string; // user ID
  role: 'TEACHER' | 'STUDENT';
  iat: number;
  exp: number;
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
  if (token) {
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
    if (token) {
      try {
        await apiClient.post('/auth/logout');
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    localStorage.clear();
  },

  // Token utility functions
  decodeToken: (token: string): TokenPayload => {
    return jwtDecode<TokenPayload>(token);
  },

  isTokenValid: (token: string): boolean => {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  },

  getCurrentUser: (): { id: string; role: string; email: string } | null => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('userEmail');
    
    if (!token || !email) return null;
    
    try {
      const decoded = api.decodeToken(token);
      if (!api.isTokenValid(token)) return null;
      
      return {
        id: decoded.sub,
        role: decoded.role,
        email: email
      };
    } catch {
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