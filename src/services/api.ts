import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api'; // Replace with your backend URL

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

export const api = {
  // Teacher APIs
  uploadAssignment: async (questionImage: File, correctAnswer: string): Promise<Assignment> => {
    const formData = new FormData();
    formData.append('questionImage', questionImage);
    formData.append('correctAnswer', correctAnswer);
    
    const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAssignments: async (): Promise<Assignment[]> => {
    const response = await axios.get(`${API_BASE_URL}/assignments`);
    return response.data;
  },

  getStudentPerformance: async (): Promise<StudentPerformance[]> => {
    const response = await axios.get(`${API_BASE_URL}/performance`);
    return response.data;
  },

  // Student APIs
  submitAnswer: async (assignmentId: string, answer: string): Promise<{ isCorrect: boolean; correctAnswer?: string }> => {
    const response = await axios.post(`${API_BASE_URL}/submitAnswer`, {
      assignmentId,
      answer,
    });
    return response.data;
  },
};