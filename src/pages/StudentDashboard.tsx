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
  RefreshCw,
  User,
  Star,
  Award,
  TrendingUp,
  Zap,
  Brain,
  GraduationCap
} from 'lucide-react';
import { authApi } from '@/services/auth.api';
import { studentApi, type StudentAssignment, type UserProfile, type SubmitAttemptResponse } from '@/services/student.api';

// Dynamic import for StudentAssignmentView
const StudentAssignmentView = lazy(() => import('../components/StudentAssignmentView'));
const StudentAssignmentResultView = lazy(() => import('../components/StudentAssignmentResultView'));

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

      // Step 2: Get all assignments for this student using the new API
      const allAssignments = await studentApi.getStudentAssignments(userProfile.id);

      // Filter to only show active assignments
      const activeAssignments = allAssignments.filter(assignment => assignment.is_active);
      setAssignments(activeAssignments);

      // Calculate stats from the assignments
      const totalAssignments = activeAssignments.length;
      const completedAssignments = activeAssignments.filter(a => a.student_status === 'SUBMITTED').length;
      
      // Calculate average score from completed assignments
      const completedWithScores = activeAssignments.filter(a => a.percentage !== null);
      const averageScore = completedWithScores.length > 0 
        ? completedWithScores.reduce((acc, a) => acc + (a.percentage || 0), 0) / completedWithScores.length
        : 0;

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

  const getStatusColor = (assignment: StudentAssignment) => {
    if (assignment.student_status === 'SUBMITTED') return 'bg-green-500';
    if (assignment.student_status === 'IN_PROGRESS') return 'bg-yellow-500';
    if (new Date() < new Date(assignment.opens_at)) return 'bg-blue-500';
    return 'bg-gray-400';
  };

  const getStatusIcon = (assignment: StudentAssignment) => {
    if (assignment.student_status === 'SUBMITTED') return <CheckCircle className="h-4 w-4" />;
    if (assignment.student_status === 'IN_PROGRESS') return <Clock className="h-4 w-4" />;
    if (new Date() < new Date(assignment.opens_at)) return <Clock className="h-4 w-4" />;
    return <BookOpen className="h-4 w-4" />;
  };

  const getStatusText = (assignment: StudentAssignment) => {
    if (assignment.student_status === 'SUBMITTED') return 'Completed';
    if (assignment.student_status === 'IN_PROGRESS') return 'In Progress';
    if (new Date() < new Date(assignment.opens_at)) return 'Not Yet Open';
    return 'Not Started';
  };

  const getProgressPercentage = (assignment: StudentAssignment) => {
    if (assignment.student_status === 'SUBMITTED') return 100;
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Enhanced Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
                  <p className="text-sm text-gray-600">Welcome back to your learning journey</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-gray-50 rounded-xl px-4 py-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-blue-500 text-white text-sm">
                    {userEmail.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">{studentProfile?.full_name || 'Student'}</p>
                  <p className="text-xs text-gray-500">{userEmail}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout} className="hover:bg-red-50 hover:text-red-600 hover:border-red-200">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Assignments</p>
                  <p className="text-3xl font-bold">{stats.totalAssignments}</p>
                  <div className="flex items-center mt-2">
                    <BookOpen className="h-4 w-4 mr-1" />
                    <span className="text-sm text-blue-100">Available to work on</span>
                  </div>
                </div>
                <BookOpen className="h-12 w-12 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Completed</p>
                  <p className="text-3xl font-bold">{stats.completedAssignments}</p>
                  <div className="flex items-center mt-2">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm text-green-100">
                      {stats.totalAssignments > 0 ? `${Math.round((stats.completedAssignments / stats.totalAssignments) * 100)}% complete` : 'Great start!'}
                    </span>
                  </div>
                </div>
                <CheckCircle className="h-12 w-12 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Average Score</p>
                  <p className="text-3xl font-bold">{stats.averageScore}%</p>
                  <div className="flex items-center mt-2">
                    <Star className="h-4 w-4 mr-1" />
                    <span className="text-sm text-purple-100">
                      {stats.averageScore >= 90 ? 'Outstanding!' : 
                       stats.averageScore >= 80 ? 'Excellent!' : 
                       stats.averageScore >= 70 ? 'Good work!' : 
                       stats.averageScore > 0 ? 'Keep improving!' : 'Start your journey!'}
                    </span>
                  </div>
                </div>
                <Trophy className="h-12 w-12 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Current Streak</p>
                  <p className="text-3xl font-bold">{stats.currentStreak} days</p>
                  <div className="flex items-center mt-2">
                    <Zap className="h-4 w-4 mr-1" />
                    <span className="text-sm text-orange-100">Keep it up!</span>
                  </div>
                </div>
                <Target className="h-12 w-12 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Main Content */}
        <div className="bg-white rounded-2xl shadow-sm border-0 overflow-hidden">
          <Tabs defaultValue="assignments" className="space-y-0">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b">
              <TabsList className="bg-white shadow-sm">
                <TabsTrigger value="assignments" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                  <BookOpen className="h-4 w-4 mr-2" />
                  My Assignments
                </TabsTrigger>
                <TabsTrigger value="solve" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                  <Brain className="h-4 w-4 mr-2" />
                  Solve Problems
                </TabsTrigger>
                <TabsTrigger value="progress" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Progress
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="assignments" className="p-6 space-y-6 m-0">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">My Assignments</h2>
                  <p className="text-gray-600 mt-1">Keep track of your homework and assignments</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchStudentData}
                  disabled={isLoading}
                  className="hover:bg-blue-50 hover:border-blue-200"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>

              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading assignments...</p>
                </div>
              ) : assignments.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="h-10 w-10 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">No Assignments Yet</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Your teacher hasn't assigned any homework yet. Check back later or contact your teacher if you believe this is an error.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {assignments.map((assignment) => {
                    const completionPercentage = getProgressPercentage(assignment);
                    
                    return (
                      <Card key={assignment.id} className="border-0 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b">
                          <div className="flex justify-between items-start">
                            <div className="space-y-3 flex-1">
                              <div className="flex items-start space-x-3">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getStatusColor(assignment).replace('bg-', 'bg-') || 'bg-gray-500'}`}>
                                  {getStatusIcon(assignment)}
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-xl font-bold text-gray-900 mb-1">{assignment.title}</h3>
                                  <p className="text-gray-600 text-sm leading-relaxed">{assignment.description}</p>
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-1 bg-white px-3 py-1 rounded-full">
                                  <Calendar className="h-4 w-4 text-red-500" />
                                  <span>Due: {new Date(assignment.due_at).toLocaleDateString()}</span>
                                </div>
                                {new Date() < new Date(assignment.opens_at) && (
                                  <div className="flex items-center space-x-1 bg-white px-3 py-1 rounded-full">
                                    <Clock className="h-4 w-4 text-orange-500" />
                                    <span>Opens: {new Date(assignment.opens_at).toLocaleDateString()}</span>
                                  </div>
                                )}
                                <div className="flex items-center space-x-1 bg-white px-3 py-1 rounded-full">
                                  <User className="h-4 w-4 text-blue-500" />
                                  <span>Class: {assignment.classroom_name}</span>
                                </div>
                                <div className="flex items-center space-x-1 bg-white px-3 py-1 rounded-full">
                                  <BookOpen className="h-4 w-4 text-purple-500" />
                                  <span>{assignment.questions.length} question{assignment.questions.length !== 1 ? 's' : ''}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end space-y-3 ml-6">
                              <Badge 
                                variant="secondary"
                                className={`${getStatusColor(assignment).replace('bg-', 'bg-gradient-to-r from-').replace('-500', '-500 to-').replace('to-', getStatusColor(assignment).replace('bg-', 'to-').replace('-500', '-600'))} text-white border-0 px-3 py-1`}
                              >
                                <span className="flex items-center space-x-1">
                                  {getStatusIcon(assignment)}
                                  <span className="font-medium">{getStatusText(assignment)}</span>
                                </span>
                              </Badge>
                              {assignment.percentage !== null && (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  <Star className="h-3 w-3 mr-1" />
                                  Score: {Math.round(assignment.percentage)}%
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <CardContent className="p-6">
                          {/* Enhanced Progress Bar */}
                          <div className="space-y-3 mb-6">
                            <div className="flex justify-between items-center text-sm">
                              <span className="font-medium text-gray-700">Progress</span>
                              <span className="text-blue-600 font-semibold">{completionPercentage}%</span>
                            </div>
                            <div className="relative">
                              <Progress 
                                value={completionPercentage}
                                className="h-3 bg-gray-100"
                              />
                              <div className="absolute inset-y-0 left-0 flex items-center">
                                <div 
                                  className="h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
                                  style={{ width: `${completionPercentage}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="flex justify-end">
                            {assignment.student_status === 'SUBMITTED' ? (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewResults(assignment.id)}
                                className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 hover:border-blue-300"
                              >
                                <Award className="h-4 w-4 mr-2" />
                                Review Answers
                              </Button>
                            ) : new Date() < new Date(assignment.opens_at) ? (
                              <Button 
                                size="sm"
                                disabled
                                variant="outline"
                                className="bg-gray-50 text-gray-500"
                              >
                                <Clock className="h-4 w-4 mr-2" />
                                Opens {new Date(assignment.opens_at).toLocaleDateString()}
                              </Button>
                            ) : (
                              <Button 
                                size="sm"
                                onClick={() => handleStartAssignment(assignment.id)}
                                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6"
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

            <TabsContent value="solve" className="p-6 space-y-6 m-0">
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Brain className="h-10 w-10 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Practice Mode Coming Soon</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                  Practice problems and additional exercises will be available here to help you improve your math skills.
                </p>
                <div className="flex justify-center space-x-4">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <Target className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-purple-700">Targeted Practice</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <Zap className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-blue-700">Quick Drills</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <Trophy className="h-6 w-6 text-green-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-green-700">Challenges</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="progress" className="p-6 space-y-6 m-0">
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Progress Tracking Coming Soon</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                  Detailed progress tracking and analytics will be available here to help you monitor your learning journey.
                </p>
                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <Star className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-blue-700">Performance Analytics</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <Award className="h-6 w-6 text-green-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-green-700">Achievement Badges</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Enhanced Assignment Dialog */}
        <Dialog open={isAssignmentDialogOpen} onOpenChange={setIsAssignmentDialogOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden bg-white rounded-2xl border-0 shadow-2xl">
            <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 -m-6 mb-4 border-b">
              <DialogTitle className="text-xl font-bold text-gray-900 flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
                Assignment
              </DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[calc(90vh-8rem)]">
              <Suspense fallback={
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading assignment...</p>
                </div>
              }>
                <StudentAssignmentView
                  assignmentId={selectedAssignmentId || undefined}
                  onComplete={handleAssignmentComplete}
                  onCancel={handleAssignmentCancel}
                />
              </Suspense>
            </div>
          </DialogContent>
        </Dialog>

        {/* Enhanced Results Dialog */}
        <Dialog open={isResultDialogOpen} onOpenChange={setIsResultDialogOpen}>
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden bg-white rounded-2xl border-0 shadow-2xl">
            <DialogHeader className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 -m-6 mb-4 border-b">
              <DialogTitle className="text-xl font-bold text-gray-900 flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-green-500" />
                Assignment Results
              </DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[calc(90vh-8rem)]">
              <Suspense fallback={
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading results...</p>
                </div>
              }>
                {selectedAssignmentForResult && (
                  <StudentAssignmentResultView
                    assignment={assignments.find(a => a.id === selectedAssignmentForResult)!}
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
