import { apiClient } from './api.client';

export interface StudentAssignment {
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
  average_score: number;
  is_active: boolean;
  student_status: 'NOT_STARTED' | 'IN_PROGRESS' | 'SUBMITTED';
  student_score?: number;
  student_submitted_at?: string;
  student_started_at?: string;
  is_submitted_by_student: boolean;
}

export interface StudentClassroom {
  id: string;
  name: string;
  code: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

export const studentApi = {
  getUserByEmail: async (email: string): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>(`/users/by-email?email=${email}`);
    return response.data;
  },

  getStudentClassrooms: async (studentId: string): Promise<StudentClassroom[]> => {
    const response = await apiClient.get<StudentClassroom[]>(`/students/${studentId}/classrooms`);
    return response.data;
  },

  getClassroomAssignments: async (classroomId: string): Promise<StudentAssignment[]> => {
    const response = await apiClient.get<StudentAssignment[]>(`/assignments/classroom/${classroomId}`);
    return response.data;
  }
};
