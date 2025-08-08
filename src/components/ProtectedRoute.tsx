import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { authApi } from '@/services/auth.api';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredUserType?: 'teacher' | 'student';
}

const ProtectedRoute = ({ children, requiredUserType }: ProtectedRouteProps) => {
  const token = localStorage.getItem('token');
  const isAuthenticated = localStorage.getItem('isAuthenticated');

  // Check if user is authenticated and token is valid
  if (!isAuthenticated || !token || !authApi.isTokenValid(token)) {
    localStorage.clear(); // Clear invalid session
    return <Navigate to="/login" replace />;
  }

  // Get current user info from token
  const currentUser = authApi.getCurrentUser();
  
  if (!currentUser) {
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }

  // Check if user type matches required type
  if (requiredUserType) {
    const userRole = currentUser.role;
    const expectedRole = requiredUserType === 'teacher' ? 'TEACHER' : 'STUDENT';
    
    if (userRole !== expectedRole) {
      // Redirect to appropriate dashboard based on user's actual role
      if (userRole === 'TEACHER') {
        return <Navigate to="/teacher-dashboard" replace />;
      } else if (userRole === 'STUDENT') {
        return <Navigate to="/student-dashboard" replace />;
      } else {
        localStorage.clear();
        return <Navigate to="/login" replace />;
      }
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
