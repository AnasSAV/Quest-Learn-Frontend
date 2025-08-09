import { apiClient } from './api.client';

export interface Question {
  id: string;
  assignment_id: string;
  prompt_text: string;
  image_key?: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'A' | 'B' | 'C' | 'D';
  per_question_seconds: number;
  points: number;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateQuestionRequest {
  assignment_id: string;
  prompt_text: string;
  image_key?: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'A' | 'B' | 'C' | 'D';
  per_question_seconds: number;
  points: number;
  order_index: number;
}

export interface ImageUploadResponse {
  image_key: string;
  url: string | null;
  public: boolean;
}

export const questionApi = {
  // Create a new question
  createQuestion: async (questionData: CreateQuestionRequest): Promise<Question> => {
    const response = await apiClient.post('/questions', questionData);
    return response.data;
  },

  // Upload question image
  uploadQuestionImage: async (imageFile: File): Promise<ImageUploadResponse> => {
    const formData = new FormData();
    formData.append('file', imageFile);
    
    const response = await apiClient.post('/questions/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete question image
  deleteQuestionImage: async (imageKey: string): Promise<void> => {
    await apiClient.delete('/questions/image', {
      data: { image_key: imageKey }
    });
  },

  // Delete a question
  deleteQuestion: async (questionId: string): Promise<void> => {
    await apiClient.delete(`/questions/${questionId}`);
  },

  // Get questions for an assignment
  getQuestions: async (assignmentId: string): Promise<Question[]> => {
    const response = await apiClient.get(`/assignments/${assignmentId}/questions`);
    return response.data;
  },
};
