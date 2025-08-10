import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  FileText, 
  TrendingUp, 
  CheckCircle, 
  XCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { api, Assignment, StudentPerformance } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [studentPerformance, setStudentPerformance] = useState<StudentPerformance[]>([]);
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [assignmentsData, performanceData] = await Promise.all([
        api.getAssignments(),
        api.getStudentPerformance()
      ]);
      
      setStudentPerformance(performanceData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error loading dashboard",
        description: "Please try refreshing the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleStudentDetails = (studentId: string) => {
    setExpandedStudents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const totalSubmissions = studentPerformance.reduce(
    (sum, student) => sum + student.submissions.length, 
    0
  );

  const averageAccuracy = studentPerformance.length > 0 
    ? studentPerformance.reduce((sum, student) => sum + student.accuracy, 0) / studentPerformance.length
    : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Teacher Dashboard</h2>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Assignments</p>
                <p className="text-2xl font-bold text-foreground">{assignments.length}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Students</p>
                <p className="text-2xl font-bold text-foreground">{studentPerformance.length}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Submissions</p>
                <p className="text-2xl font-bold text-foreground">{totalSubmissions}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Accuracy</p>
                <p className="text-2xl font-bold text-foreground">
                  {averageAccuracy.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Student Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Student Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {studentPerformance.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No student submissions yet.
            </p>
          ) : (
            <div className="space-y-4">
              {studentPerformance.map((student) => (
                <div key={student.studentId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium text-foreground">{student.studentName}</h4>
                      <Badge variant="outline">
                        {student.submissions.length} submissions
                      </Badge>
                      <Badge 
                        variant={student.accuracy >= 70 ? "default" : "destructive"}
                      >
                        {student.accuracy.toFixed(1)}% accuracy
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleStudentDetails(student.studentId)}
                    >
                      {expandedStudents.has(student.studentId) ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Hide Details
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </>
                      )}
                    </Button>
                  </div>

                  {expandedStudents.has(student.studentId) && (
                    <div className="mt-4 space-y-2">
                      <h5 className="font-medium text-sm text-muted-foreground">
                        Individual Submissions:
                      </h5>
                      <div className="grid gap-2">
                        {student.submissions.map((submission) => (
                          <div 
                            key={submission.id}
                            className="flex items-center justify-between p-3 bg-muted/30 rounded-md"
                          >
                            <div className="flex items-center gap-3">
                              {submission.isCorrect ? (
                                <CheckCircle className="h-4 w-4 text-success" />
                              ) : (
                                <XCircle className="h-4 w-4 text-destructive" />
                              )}
                              <span className="text-sm">
                                Assignment {submission.assignmentId}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-mono bg-background px-2 py-1 rounded">
                                {submission.studentAnswer}
                              </span>
                              <span className="text-muted-foreground">
                                {new Date(submission.submittedAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;