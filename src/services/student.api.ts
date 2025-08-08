import { apiClient } from './api.client';

export interface StudentSubmission {
  id: string;
  assignmentId: string;
  studentAnswer: string;
  isCorrect: boolean;
  submittedAt: string;
}

export interface StudentAssignment {
  id: string;
  title: string;
  dueDate: string;
  status: 'completed' | 'in-progress' | 'pending';
  score: number | null;
  totalQuestions: number;
  completedQuestions: number;
}

export const studentApi = {
  // Submit answer for an assignment
  submitAnswer: async (assignmentId: string, answer: string): Promise<{ 
    isCorrect: boolean; 
    correctAnswer?: string 
  }> => {
    const response = await apiClient.post('/submitAnswer', {
      assignmentId,
      answer,
    });
    return response.data;
  },

  // Get student's assignments
  getMyAssignments: async (): Promise<StudentAssignment[]> => {
    const response = await apiClient.get('/student/assignments');
    return response.data;
  },

  // Get student dashboard stats
  getDashboardStats: async (): Promise<{
    totalAssignments: number;
    completedAssignments: number;
    averageScore: number;
    currentStreak: number;
  }> => {
    const response = await apiClient.get('/student/stats');
    return response.data;
  },

  // Get student progress
  getProgress: async (): Promise<any> => {
    const response = await apiClient.get('/student/progress');
    return response.data;
  },
};
