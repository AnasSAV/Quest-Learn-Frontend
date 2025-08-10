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

// Comprehensive Student Report Types
export interface StudentInfo {
  student_id: string;
  student_name: string;
  student_email: string;
  created_at: string;
}

export interface ClassroomEnrollment {
  classroom_id: string;
  classroom_name: string;
  classroom_code: string;
  joined_at: string;
}

export interface StudentStatistics {
  total_assignments: number;
  attempted_assignments: number;
  completed_assignments: number;
  total_points_earned: number;
  total_possible_points: number;
  overall_percentage: number;
}

export interface QuestionDetail {
  question_id: string;
  question_text: string;
  image_key: string;
  order_index: number;
  points: number;
  status: string;
}

export interface AssignmentResult {
  assignment_id: string;
  assignment_title: string;
  assignment_description: string;
  classroom_name: string;
  created_at: string;
  opens_at: string;
  due_at: string;
  max_possible_score: number;
  total_questions: number;
  attempt_status: string;
  student_score: number | null;
  percentage: number | null;
  started_at: string | null;
  submitted_at: string | null;
  question_details: QuestionDetail[];
}

export interface StudentReport {
  student_info: StudentInfo;
  classroom_enrollments: ClassroomEnrollment[];
  statistics: StudentStatistics;
  assignment_results: AssignmentResult[];
}

export interface ComprehensiveReport {
  teacher_id: string;
  teacher_name: string;
  total_students: number;
  students: StudentReport[];
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

  // Delete assignment
  deleteAssignment: async (assignmentId: string): Promise<void> => {
    await apiClient.delete(`/assignments/${assignmentId}`);
  },

  // Get comprehensive student report
  getComprehensiveStudentReport: async (): Promise<ComprehensiveReport> => {
    const response = await apiClient.get('/teachers/students/comprehensive-report');
    return response.data;
  },
};
