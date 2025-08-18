import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import StudentAssignmentView from '@/components/StudentAssignmentView';
import { SubmitAttemptResponse } from '@/services/student.api';

const StudentAssignmentPage = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();

  const handleComplete = (result: SubmitAttemptResponse) => {
    // Navigate back to dashboard after completion
    navigate('/student-dashboard');
  };

  const handleCancel = () => {
    // Navigate back to dashboard if cancelled
    navigate('/student-dashboard');
  };

  if (!assignmentId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Assignment Not Found</h1>
          <p className="text-gray-600 mb-6">The assignment you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/student-dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header with back button */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              onClick={() => navigate('/student-dashboard')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">Assignment</h1>
          </div>
        </div>
      </div>

      {/* Assignment content */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StudentAssignmentView
          assignmentId={assignmentId}
          onComplete={handleComplete}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default StudentAssignmentPage;
