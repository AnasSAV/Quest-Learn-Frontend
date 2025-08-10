import { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  LogOut,
  Trophy,
  Target,
  Calendar,
  Play,
  RefreshCw
} from 'lucide-react';
import { authApi } from '@/services/auth.api';
import { studentApi, type StudentAssignment, type UserProfile, type SubmitAttemptResponse } from '@/services/student.api';

// Dynamic import for StudentAssignmentView
const StudentAssignmentView = lazy(() => import('../components/StudentAssignmentView'));
const AssignmentResultView = lazy(() => import('../components/AssignmentResultView'));

const StudentDashboard = () => {
  const [userEmail, setUserEmail] = useState('');
  const [studentProfile, setStudentProfile] = useState<UserProfile | null>(null);
  const [assignments, setAssignments] = useState<StudentAssignment[]>([]);
  const [stats, setStats] = useState({
    totalAssignments: 0,
    completedAssignments: 0,
    averageScore: 0,
    currentStreak: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false);
  const [selectedAssignmentForResult, setSelectedAssignmentForResult] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    const currentUser = authApi.getCurrentUser();

    if (!currentUser || currentUser.role !== 'STUDENT') {
      navigate('/login');
      return;
    }

    // Get the email from localStorage (set during login)
    const email = localStorage.getItem('userEmail');
    setUserEmail(email || '');

    // Fetch student data
    fetchStudentData();
  }, [navigate]);

  const fetchStudentData = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Get email from localStorage
      const email = localStorage.getItem('userEmail');
      if (!email) {
        navigate('/login');
        return;
      }

      // Step 1: Get user profile by email to get student_id
      const userProfile = await studentApi.getUserByEmail(email);
      setStudentProfile({
        id: userProfile.id,
        email: userProfile.email,
        full_name: userProfile.full_name,
        role: userProfile.role
      });

      // Step 2: Get student's classrooms
      const classrooms = await studentApi.getStudentClassrooms(userProfile.id);
      
      // Step 3: Get assignments for each classroom and combine them
      let allAssignments: StudentAssignment[] = [];
      for (const classroom of classrooms) {
        const classroomAssignments = await studentApi.getClassroomAssignments(classroom.id);
        allAssignments = [...allAssignments, ...classroomAssignments];
      }

      // Filter to only show active assignments
      const activeAssignments = allAssignments.filter(assignment => assignment.is_active);
      setAssignments(activeAssignments);

      // Calculate stats from the assignments
      const totalAssignments = activeAssignments.length;
      const completedAssignments = activeAssignments.filter(a => a.is_submitted_by_student).length;
      const averageScore = activeAssignments
        .filter(a => a.student_score !== undefined)
        .reduce((acc, a) => acc + (a.student_score || 0), 0) / 
        Math.max(1, activeAssignments.filter(a => a.student_score !== undefined).length);

      setStats({
        totalAssignments,
        completedAssignments,
        averageScore: Math.round(averageScore * 100) / 100,
        currentStreak: 0 // Can be calculated based on submission dates if needed
      });

    } catch (err: any) {
      console.error('Error fetching student data:', err);
      setError('Failed to load student data');
      
      setAssignments([]);
      setStats({
        totalAssignments: 0,
        completedAssignments: 0,
        averageScore: 0,
        currentStreak: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      navigate('/login');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED': return 'bg-green-500';
      case 'IN_PROGRESS': return 'bg-yellow-500';
      case 'NOT_STARTED': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUBMITTED': return <CheckCircle className="h-4 w-4" />;
      case 'IN_PROGRESS': return <Clock className="h-4 w-4" />;
      case 'NOT_STARTED': return <BookOpen className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SUBMITTED': return 'Completed';
      case 'IN_PROGRESS': return 'In Progress';
      case 'NOT_STARTED': return 'Not Started';
      default: return 'Not Started';
    }
  };

  const getProgressPercentage = (assignment: StudentAssignment) => {
    if (assignment.is_submitted_by_student) return 100;
    if (assignment.student_status === 'IN_PROGRESS') return 50;
    return 0;
  };

  const handleStartAssignment = (assignmentId: string) => {
    setSelectedAssignmentId(assignmentId);
    setIsAssignmentDialogOpen(true);
  };

  const handleAssignmentComplete = (result: SubmitAttemptResponse) => {
    setIsAssignmentDialogOpen(false);
    setSelectedAssignmentId(null);
    // Refresh assignments to get updated status
    fetchStudentData();
  };

  const handleAssignmentCancel = () => {
    setIsAssignmentDialogOpen(false);
    setSelectedAssignmentId(null);
  };

  const handleViewResults = (assignmentId: string) => {
    setSelectedAssignmentForResult(assignmentId);
    setIsResultDialogOpen(true);
  };

  const handleResultsClose = () => {
    setIsResultDialogOpen(false);
    setSelectedAssignmentForResult(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-foreground">Student Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Avatar>
                  <AvatarFallback>
                    {userEmail.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">{userEmail}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Assignments</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalAssignments}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-foreground">{stats.completedAssignments}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                  <p className="text-2xl font-bold text-foreground">{stats.averageScore}%</p>
                </div>
                <Target className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                  <p className="text-2xl font-bold text-foreground">{stats.currentStreak} days</p>
                </div>
                <Trophy className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="assignments" className="space-y-6">
          <TabsList>
            <TabsTrigger value="assignments">My Assignments</TabsTrigger>
            <TabsTrigger value="solve">Solve Problems</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="assignments" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-foreground">My Assignments</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchStudentData}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading assignments...</p>
              </div>
            ) : assignments.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Assignments Yet</h3>
                <p className="text-muted-foreground">
                  Your teacher hasn't assigned any homework yet. Check back later!
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {assignments.map((assignment) => {
                  const completionPercentage = getProgressPercentage(assignment);
                  
                  return (
                    <Card key={assignment.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="space-y-2">
                            <h3 className="text-lg font-semibold text-foreground">{assignment.title}</h3>
                            <p className="text-sm text-muted-foreground">{assignment.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>Due: {new Date(assignment.due_at).toLocaleDateString()}</span>
                              </div>
                              <span>Class: {assignment.classroom_name}</span>
                              <span>{assignment.total_questions} question{assignment.total_questions !== 1 ? 's' : ''}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant="secondary"
                              className={`${getStatusColor(assignment.student_status)} text-white`}
                            >
                              <span className="flex items-center space-x-1">
                                {getStatusIcon(assignment.student_status)}
                                <span>{getStatusText(assignment.student_status)}</span>
                              </span>
                            </Badge>
                            {assignment.student_score !== undefined && (
                              <Badge variant="outline">
                                Score: {Math.round(assignment.student_score * 100)}%
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{completionPercentage}%</span>
                          </div>
                          <Progress 
                            value={completionPercentage}
                            className="h-2"
                          />
                        </div>

                        {/* Action Button */}
                        <div className="flex justify-end">
                          {assignment.student_status === 'SUBMITTED' ? (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewResults(assignment.id)}
                            >
                              Review Answers
                            </Button>
                          ) : (
                            <Button 
                              size="sm"
                              onClick={() => handleStartAssignment(assignment.id)}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              {assignment.student_status === 'NOT_STARTED' ? 'Start Assignment' : 'Continue'}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="solve">
            <Card>
              <CardHeader>
                <CardTitle>Solve Math Problems</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Practice Mode Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Practice problems and additional exercises will be available here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress">
            <Card>
              <CardHeader>
                <CardTitle>My Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Progress Tracking Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Detailed progress tracking and analytics will be available here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Assignment Dialog */}
        <Dialog open={isAssignmentDialogOpen} onOpenChange={setIsAssignmentDialogOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Assignment</DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[calc(90vh-8rem)]">
              <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
                <StudentAssignmentView
                  assignmentId={selectedAssignmentId || undefined}
                  onComplete={handleAssignmentComplete}
                  onCancel={handleAssignmentCancel}
                />
              </Suspense>
            </div>
          </DialogContent>
        </Dialog>

        {/* Results Dialog */}
        <Dialog open={isResultDialogOpen} onOpenChange={setIsResultDialogOpen}>
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Assignment Results</DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[calc(90vh-8rem)]">
              <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
                {selectedAssignmentForResult && studentProfile && (
                  <AssignmentResultView
                    assignmentId={selectedAssignmentForResult}
                    studentId={studentProfile.id}
                    onBack={handleResultsClose}
                  />
                )}
              </Suspense>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default StudentDashboard;
