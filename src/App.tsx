import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  // Check if user is authenticated and redirect accordingly
  const isAuthenticated = localStorage.getItem('isAuthenticated');
  const userType = localStorage.getItem('userType');

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Default route - redirect based on authentication */}
            <Route 
              path="/" 
              element={
                isAuthenticated ? (
                  userType === 'teacher' ? (
                    <Navigate to="/teacher-dashboard" replace />
                  ) : (
                    <Navigate to="/student-dashboard" replace />
                  )
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            
            {/* Login route */}
            <Route 
              path="/login" 
              element={
                isAuthenticated ? (
                  userType === 'teacher' ? (
                    <Navigate to="/teacher-dashboard" replace />
                  ) : (
                    <Navigate to="/student-dashboard" replace />
                  )
                ) : (
                  <Login />
                )
              } 
            />
            
            {/* Protected Teacher Dashboard */}
            <Route 
              path="/teacher-dashboard" 
              element={
                <ProtectedRoute requiredUserType="teacher">
                  <TeacherDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Protected Student Dashboard */}
            <Route 
              path="/student-dashboard" 
              element={
                <ProtectedRoute requiredUserType="student">
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Legacy routes - redirect to dashboards */}
            <Route path="/teacher" element={<Navigate to="/teacher-dashboard" replace />} />
            <Route path="/student" element={<Navigate to="/student-dashboard" replace />} />
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
