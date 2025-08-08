import { apiClient } from './api.client';

export interface Assignment {
  id: string;
  questionImage: string;
  correctAnswer: string;
  createdAt: string;
}

export interface StudentPerformance {
  studentId: string;
  studentName: string;
  submissions: any[];
  accuracy: number;
}

export const teacherApi = {
  // Upload assignment
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

  // Get all assignments
  getAssignments: async (): Promise<Assignment[]> => {
    const response = await apiClient.get('/assignments');
    return response.data;
  },

  // Get student performance data
  getStudentPerformance: async (): Promise<StudentPerformance[]> => {
    const response = await apiClient.get('/performance');
    return response.data;
  },

  // Get dashboard stats
  getDashboardStats: async (): Promise<{
    totalAssignments: number;
    activeStudents: number;
    completedSubmissions: number;
    averageScore: number;
  }> => {
    const response = await apiClient.get('/teacher/stats');
    return response.data;
  },

  // Get recent assignments for dashboard
  getRecentAssignments: async (): Promise<Array<{
    id: number;
    title: string;
    students: number;
    submissions: number;
    dueDate: string;
  }>> => {
    const response = await apiClient.get('/teacher/recent-assignments');
    return response.data;
  },
};
