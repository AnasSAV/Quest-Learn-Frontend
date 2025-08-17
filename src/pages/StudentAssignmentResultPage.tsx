import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import StudentAssignmentResultView from '@/components/StudentAssignmentResultView';
import { studentApi, type StudentAssignment } from '@/services/student.api';
import { authApi } from '@/services/auth.api';

const StudentAssignmentResultPage = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<StudentAssignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (assignmentId) {
      fetchAssignmentData();
    }
  }, [assignmentId]);

  const fetchAssignmentData = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Get current user
      const currentUser = authApi.getCurrentUser();
      if (!currentUser) {
        navigate('/login');
        return;
      }

      // Get username and user profile
      const username = localStorage.getItem('userName');
      if (!username) {
        navigate('/login');
        return;
      }

      const userProfile = await studentApi.getUserByUsername(username);
      
      // Get all student assignments
      const allAssignments = await studentApi.getStudentAssignments(userProfile.id);
      
      // Find the specific assignment
      const targetAssignment = allAssignments.find(a => a.id === assignmentId);
      
      if (!targetAssignment) {
        setError('Assignment not found');
        return;
      }

      setAssignment(targetAssignment);
    } catch (err: any) {
      console.error('Error fetching assignment data:', err);
      setError('Failed to load assignment data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/student-dashboard');
  };

  if (!assignmentId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Assignment Not Found</h1>
          <p className="text-gray-600 mb-6">The assignment you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/student-dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assignment results...</p>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Results</h1>
          <p className="text-gray-600 mb-6">{error || 'Assignment not found'}</p>
          <Button onClick={() => navigate('/student-dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Results content */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StudentAssignmentResultView
          assignment={assignment}
          onBack={handleBack}
        />
      </div>
    </div>
  );
};

export default StudentAssignmentResultPage;
