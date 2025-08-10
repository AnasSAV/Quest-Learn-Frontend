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

export interface AttemptQuestion {
  id: string;
  prompt_text: string;
  image_key: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  per_question_seconds: number;
  points: number;
  order_index: number;
}

export interface StartAttemptResponse {
  attempt_id: string;
  questions: AttemptQuestion[];
}

export interface AnswerRequest {
  question_id: string;
  chosen_option: 'A' | 'B' | 'C' | 'D';
  time_taken_seconds: number;
}

export interface SubmitAttemptResponse {
  message: string;
  status: string;
  total_score: number;
  questions_answered: number;
  total_questions: number;
  submitted_at: string;
  is_late: boolean;
}

export interface QuestionResponse {
  question_id: string;
  prompt_text: string;
  image_key: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  chosen_option: 'A' | 'B' | 'C' | 'D';
  correct_option: 'A' | 'B' | 'C' | 'D';
  is_correct: boolean;
  points_earned: number;
  max_points: number;
  time_taken_seconds: number;
  order_index: number;
}

export interface AssignmentResult {
  attempt_id: string;
  assignment_id: string;
  assignment_title: string;
  student_id: string;
  student_name: string;
  status: string;
  total_score: number;
  max_possible_score: number;
  percentage: number;
  started_at: string;
  submitted_at: string;
  time_taken_minutes: number;
  responses: QuestionResponse[];
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
  },

  // Assignment attempt methods
  startAssignment: async (assignmentId: string): Promise<StartAttemptResponse> => {
    const response = await apiClient.post<StartAttemptResponse>(`/attempts/start/${assignmentId}`);
    return response.data;
  },

  answerQuestion: async (attemptId: string, answerData: AnswerRequest): Promise<void> => {
    await apiClient.post(`/attempts/${attemptId}/answer`, answerData);
  },

  submitAttempt: async (attemptId: string): Promise<SubmitAttemptResponse> => {
    const response = await apiClient.post<SubmitAttemptResponse>(`/attempts/${attemptId}/submit`);
    return response.data;
  },

  // Get assignment result for student
  getAssignmentResult: async (assignmentId: string, studentId: string): Promise<AssignmentResult> => {
    const response = await apiClient.get<AssignmentResult>(`/assignments/${assignmentId}/student/${studentId}/result`);
    return response.data;
  }
};
