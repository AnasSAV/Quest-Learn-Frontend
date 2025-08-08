import StudentAssignmentView from '@/components/StudentAssignmentView';

const StudentHome = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Student Panel</h1>
          <p className="text-muted-foreground">
            Complete your math assignments and get instant feedback.
          </p>
        </div>

        <StudentAssignmentView />
      </div>
    </div>
  );
};

export default StudentHome;