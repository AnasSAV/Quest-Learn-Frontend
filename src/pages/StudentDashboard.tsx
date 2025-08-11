import { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  GraduationCap,
  Plus,
  Users,
  Filter
} from 'lucide-react';
import { authApi } from '@/services/auth.api';
import { studentApi, type StudentAssignment, type UserProfile, type SubmitAttemptResponse, type StudentClassroom } from '@/services/student.api';
import { toast } from '@/components/ui/sonner';

// Dynamic import for StudentAssignmentView
const StudentAssignmentView = lazy(() => import('../components/StudentAssignmentView'));
const StudentAssignmentResultView = lazy(() => import('../components/StudentAssignmentResultView'));

const StudentDashboard = () => {
  const [userName, setUserName] = useState('');
  const [studentProfile, setStudentProfile] = useState<UserProfile | null>(null);
  const [assignments, setAssignments] = useState<StudentAssignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<StudentAssignment[]>([]);
  const [studentClassrooms, setStudentClassrooms] = useState<StudentClassroom[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string | null>(null);
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
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [joinClassroomCode, setJoinClassroomCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    const currentUser = authApi.getCurrentUser();

    if (!currentUser || currentUser.role !== 'STUDENT') {
      navigate('/login');
      return;
    }

    // Get the username from localStorage (set during login)
    const username = localStorage.getItem('userName');
    setUserName(username || '');

    // Fetch student data
    fetchStudentData();
  }, [navigate]);

  // Filter assignments when classroom selection changes
  useEffect(() => {
    if (selectedClassroomId === null) {
      setFilteredAssignments(assignments);
    } else {
      const filtered = assignments.filter(assignment => assignment.classroom_id === selectedClassroomId);
      setFilteredAssignments(filtered);
    }
  }, [assignments, selectedClassroomId]);

  const fetchStudentData = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Get username from localStorage
      const username = localStorage.getItem('userName');
      if (!username) {
        navigate('/login');
        return;
      }

      // Step 1: Get user profile by username to get student_id
      const userProfile = await studentApi.getUserByUsername(username);
      setStudentProfile({
        id: userProfile.id,
        user_name: userProfile.user_name,
        email: userProfile.email,
        full_name: userProfile.full_name,
        role: userProfile.role
      });

      // Step 2: Get student classrooms
      const classrooms = await studentApi.getStudentClassrooms(userProfile.id);
      setStudentClassrooms(classrooms);

      // Step 3: Get all assignments for this student using the new API
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
      setStudentClassrooms([]);
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
    }
  };

  const handleJoinClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinClassroomCode.trim() || !studentProfile?.id) return;

    try {
      setIsJoining(true);
      await studentApi.joinClassroom(joinClassroomCode.trim());
      
      // Refresh student data to include new classroom and assignments
      await fetchStudentData();
      
      setJoinClassroomCode('');
      setIsJoinDialogOpen(false);
      toast.success('Joined classroom successfully!');
    } catch (err: any) {
      console.error('Error joining classroom:', err);
      toast.error(err.response?.data?.message || 'Failed to join classroom');
    } finally {
      setIsJoining(false);
    }
  };

  const handleClassroomFilter = (classroomId: string | null) => {
    setSelectedClassroomId(classroomId);
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
                    {userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">{studentProfile?.full_name || 'Student'}</p>
                  <p className="text-xs text-gray-500">Student</p>
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
                  <p className="text-3xl font-bold">{filteredAssignments.length}</p>
                  <div className="flex items-center mt-2">
                    <BookOpen className="h-4 w-4 mr-1" />
                    <span className="text-sm text-blue-100">
                      {selectedClassroomId ? 'In this classroom' : 'Available to work on'}
                    </span>
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
                  <p className="text-3xl font-bold">{filteredAssignments.filter(a => a.student_status === 'SUBMITTED').length}</p>
                  <div className="flex items-center mt-2">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    <span className="text-sm text-green-100">
                      {filteredAssignments.length > 0 ? `${Math.round((filteredAssignments.filter(a => a.student_status === 'SUBMITTED').length / filteredAssignments.length) * 100)}% complete` : 'Great start!'}
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
                  <p className="text-3xl font-bold">{(() => {
                    const completedWithScores = filteredAssignments.filter(a => a.percentage !== null);
                    const avgScore = completedWithScores.length > 0 
                      ? completedWithScores.reduce((acc, a) => acc + (a.percentage || 0), 0) / completedWithScores.length
                      : 0;
                    return Math.round(avgScore * 100) / 100;
                  })()}%</p>
                  <div className="flex items-center mt-2">
                    <Star className="h-4 w-4 mr-1" />
                    <span className="text-sm text-purple-100">
                      {(() => {
                        const completedWithScores = filteredAssignments.filter(a => a.percentage !== null);
                        const avgScore = completedWithScores.length > 0 
                          ? completedWithScores.reduce((acc, a) => acc + (a.percentage || 0), 0) / completedWithScores.length
                          : 0;
                        return avgScore >= 90 ? 'Outstanding!' : 
                               avgScore >= 80 ? 'Excellent!' : 
                               avgScore >= 70 ? 'Good work!' : 
                               avgScore > 0 ? 'Keep improving!' : 'Start your journey!';
                      })()}
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
                <div className="flex items-center space-x-3">
                  <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Join Classroom
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Users className="h-4 w-4 text-green-600" />
                          </div>
                          <span>Join Classroom</span>
                        </DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleJoinClassroom} className="space-y-6">
                        <div className="space-y-3">
                          <Label htmlFor="classroomCode" className="text-sm font-medium">
                            Classroom Code
                          </Label>
                          <Input
                            id="classroomCode"
                            value={joinClassroomCode}
                            onChange={(e) => setJoinClassroomCode(e.target.value)}
                            placeholder="Enter classroom code"
                            className="h-11 transition-all duration-200 focus:ring-2 focus:ring-green-500/20 font-mono"
                            required
                          />
                          <p className="text-xs text-gray-500">
                            Ask your teacher for the classroom code
                          </p>
                        </div>
                        <div className="flex justify-end space-x-3 pt-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsJoinDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={isJoining}
                            className="bg-green-600 hover:bg-green-700 min-w-[100px]"
                          >
                            {isJoining ? (
                              <div className="flex items-center space-x-2">
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Joining...</span>
                              </div>
                            ) : (
                              'Join'
                            )}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
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
              </div>

              {/* Classroom Filter */}
              {studentClassrooms.length > 0 && (
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Filter className="h-5 w-5 text-blue-600" />
                        <div>
                          <h3 className="font-medium text-gray-900">Filter by Classroom</h3>
                          <p className="text-sm text-gray-600">Show assignments from a specific classroom</p>
                        </div>
                      </div>
                      <div className="w-64">
                        <Select value={selectedClassroomId || 'all'} onValueChange={(value) => handleClassroomFilter(value === 'all' ? null : value)}>
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="All Classrooms" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Classrooms</SelectItem>
                            {studentClassrooms.map((classroom) => (
                              <SelectItem key={classroom.id} value={classroom.id}>
                                {classroom.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

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
              ) : filteredAssignments.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="h-10 w-10 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {selectedClassroomId ? 'No Assignments in This Classroom' : 'No Assignments Yet'}
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    {selectedClassroomId 
                      ? 'This classroom doesn\'t have any assignments yet. Check back later or try selecting a different classroom.'
                      : studentClassrooms.length === 0 
                        ? 'You haven\'t joined any classrooms yet. Join a classroom to see assignments.'
                        : 'Your teacher hasn\'t assigned any homework yet. Check back later or contact your teacher if you believe this is an error.'
                    }
                  </p>
                  {studentClassrooms.length === 0 && (
                    <Button 
                      onClick={() => setIsJoinDialogOpen(true)}
                      className="mt-4 bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Join Your First Classroom
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid gap-6">
                  {filteredAssignments.map((assignment) => {
                    const completionPercentage = getProgressPercentage(assignment);
                    const isCompleted = assignment.student_status === 'SUBMITTED';
                    const isLocked = new Date() < new Date(assignment.opens_at);

                    const statusStyle = (() => {
                      if (isCompleted) return { border: 'border-l-4 border-blue-500', badge: 'bg-green-100 text-green-700' };
                      if (assignment.student_status === 'IN_PROGRESS') return { border: 'border-l-4 border-blue-500', badge: 'bg-blue-100 text-blue-700' };
                      if (isLocked) return { border: 'border-l-4 border-orange-500', badge: 'bg-orange-100 text-orange-700' };
                      return { border: 'border-l-4 border-gray-300', badge: 'bg-gray-100 text-gray-700' };
                    })();

                    return (
                      <Card key={assignment.id} className={`overflow-hidden transition-shadow duration-200 hover:shadow-lg ${statusStyle.border}`}>
                        <div className="p-5 bg-white">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-semibold text-gray-900 truncate">{assignment.title}</h3>
                                <Badge className={`${statusStyle.badge} border-0`}>{getStatusText(assignment)}</Badge>
                              </div>
                              <p className="text-sm text-gray-600 line-clamp-2">{assignment.description}</p>
                            </div>
                            <div className="text-right shrink-0">
                              {assignment.percentage !== null ? (
                                <div className="text-sm font-medium text-gray-700">
                                  <Star className="inline h-4 w-4 mr-1 text-yellow-500 align-middle" />
                                  {Math.round(assignment.percentage)}%
                                </div>
                              ) : (
                                <div className={`text-sm font-medium ${isCompleted ? 'text-green-600' : 'text-blue-600'}`}>
                                  {completionPercentage}%
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
                            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                              <Calendar className="h-3.5 w-3.5 text-gray-600" />
                              <span className="text-gray-700">Due: {new Date(assignment.due_at).toLocaleDateString()}</span>
                            </div>
                            {isLocked && (
                              <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-200">
                                <Clock className="h-3.5 w-3.5 text-orange-600" />
                                <span className="text-orange-700">Opens: {new Date(assignment.opens_at).toLocaleDateString()}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                              <User className="h-3.5 w-3.5 text-blue-600" />
                              <span className="text-gray-700">{assignment.classroom_name}</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                              <BookOpen className="h-3.5 w-3.5 text-purple-600" />
                              <span className="text-gray-700">{assignment.questions.length} question{assignment.questions.length !== 1 ? 's' : ''}</span>
                            </div>
                          </div>

                          <div className="mt-4 flex justify-end">
                            {isCompleted ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewResults(assignment.id)}
                                className="px-4"
                              >
                                <Award className="h-4 w-4 mr-2" />
                                Review Answers
                              </Button>
                            ) : isLocked ? (
                              <Button size="sm" disabled variant="outline" className="px-4">
                                <Clock className="h-4 w-4 mr-2" />
                                Opens {new Date(assignment.opens_at).toLocaleDateString()}
                              </Button>
                            ) : (
                              <Button size="sm" onClick={() => handleStartAssignment(assignment.id)} className="px-5">
                                <Play className="h-4 w-4 mr-2" />
                                {assignment.student_status === 'NOT_STARTED' ? 'Start Assignment' : 'Continue'}
                              </Button>
                            )}
                          </div>
                        </div>
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
