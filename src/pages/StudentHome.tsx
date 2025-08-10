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

        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-foreground mb-2">Go to Dashboard</h3>
          <p className="text-muted-foreground">
            Visit your dashboard to see and complete your assignments.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentHome;