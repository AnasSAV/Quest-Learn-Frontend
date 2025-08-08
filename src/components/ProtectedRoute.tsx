import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredUserType?: 'teacher' | 'student';
}

const ProtectedRoute = ({ children, requiredUserType }: ProtectedRouteProps) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  const userType = localStorage.getItem('userType');

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredUserType && userType !== requiredUserType) {
    // Redirect to appropriate dashboard based on user type
    if (userType === 'teacher') {
      return <Navigate to="/teacher-dashboard" replace />;
    } else if (userType === 'student') {
      return <Navigate to="/student-dashboard" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
