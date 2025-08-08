// Export all APIs from a single entry point
export * from './auth.api';
export * from './teacher.api';
export * from './student.api';
export * from './api.client';

// Legacy api object for backward compatibility
import { authApi } from './auth.api';
import { teacherApi } from './teacher.api';
import { studentApi } from './student.api';

export const api = {
  // Auth methods
  login: authApi.login,
  logout: authApi.logout,
  decodeToken: authApi.decodeToken,
  isTokenValid: authApi.isTokenValid,
  getCurrentUser: authApi.getCurrentUser,
  
  // Teacher methods
  uploadAssignment: teacherApi.uploadAssignment,
  getAssignments: teacherApi.getAssignments,
  getStudentPerformance: teacherApi.getStudentPerformance,
  
  // Student methods
  submitAnswer: studentApi.submitAnswer,
};
