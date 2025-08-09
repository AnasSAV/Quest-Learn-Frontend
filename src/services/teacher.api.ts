import { apiClient } from './api.client';

export interface CreateAssignmentRequest {
  classroom_id: string;
  title: string;
  description: string;
  opens_at: string;
  due_at: string;
  shuffle_questions: boolean;
}

export interface Assignment {
  id: string;
  classroom_id: string;
  title: string;
  description: string;
  opens_at: string;
  due_at: string;
  shuffle_questions: boolean;
  created_at: string;
  classroom_name: string;
  total_questions: number;
  total_attempts: number;
  unique_students_attempted: number;
  completed_attempts: number;
  average_score: number | null;
  is_active: boolean;
}

export interface LegacyAssignment {
  id: string;
  questionImage: string;
  correctAnswer: string;
  createdAt: string;
}

export interface Classroom {
  id: string;
  name: string;
  created_at?: string;
  teacher_id?: string;
}

export interface ClassroomsResponse {
  count: number;
  classrooms: Classroom[];
}

export interface StudentPerformance {
  studentId: string;
  studentName: string;
  submissions: any[];
  accuracy: number;
}

export const teacherApi = {
  // Upload assignment (legacy)
  uploadAssignment: async (questionImage: File, correctAnswer: string): Promise<LegacyAssignment> => {
    const formData = new FormData();
    formData.append('questionImage', questionImage);
    formData.append('correctAnswer', correctAnswer);
    
    const response = await apiClient.post('teachers/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get all assignments for teacher
  getAllAssignments: async (): Promise<Assignment[]> => {
    const response = await apiClient.get('/assignments/all');
    return response.data;
  },

  // Create new assignment
  createAssignment: async (assignmentData: CreateAssignmentRequest): Promise<Assignment> => {
    const response = await apiClient.post('/assignments', assignmentData);
    return response.data;
  },

  // Classroom management
  createClassroom: async (name: string): Promise<Classroom> => {
    const response = await apiClient.post('/teachers/classrooms', { name });
    return response.data;
  },
  
  getAllClassrooms: async (): Promise<Classroom[]> => {
    const response = await apiClient.get('/teachers/classrooms/all');
    const data: ClassroomsResponse = response.data;
    return data.classrooms || [];
  },
  // Get all assignments (legacy)
  getAssignments: async (): Promise<LegacyAssignment[]> => {
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
