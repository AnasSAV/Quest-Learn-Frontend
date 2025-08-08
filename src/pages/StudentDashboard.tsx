import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  LogOut,
  Trophy,
  Target,
  Calendar,
  Play
} from 'lucide-react';
import StudentAssignmentView from '@/components/StudentAssignmentView';

const StudentDashboard = () => {
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const userType = localStorage.getItem('userType');
    const email = localStorage.getItem('userEmail');

    if (!isAuthenticated || userType !== 'student') {
      navigate('/login');
      return;
    }

    setUserEmail(email || '');
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Mock data - replace with actual API calls
  const stats = {
    totalAssignments: 8,
    completedAssignments: 5,
    averageScore: 85,
    currentStreak: 3
  };

  const assignments = [
    { 
      id: 1, 
      title: 'Algebra Basics', 
      dueDate: '2025-08-10', 
      status: 'completed',
      score: 92,
      totalQuestions: 10,
      completedQuestions: 10
    },
    { 
      id: 2, 
      title: 'Geometry Problems', 
      dueDate: '2025-08-12', 
      status: 'in-progress',
      score: null,
      totalQuestions: 15,
      completedQuestions: 8
    },
    { 
      id: 3, 
      title: 'Calculus Quiz', 
      dueDate: '2025-08-15', 
      status: 'pending',
      score: null,
      totalQuestions: 12,
      completedQuestions: 0
    },
    { 
      id: 4, 
      title: 'Statistics Homework', 
      dueDate: '2025-08-18', 
      status: 'pending',
      score: null,
      totalQuestions: 8,
      completedQuestions: 0
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-yellow-500';
      case 'pending': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in-progress': return <Clock className="h-4 w-4" />;
      case 'pending': return <BookOpen className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
            </div>

            <div className="grid gap-4">
              {assignments.map((assignment) => (
                <Card key={assignment.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-foreground">{assignment.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>Due: {assignment.dueDate}</span>
                          </div>
                          <span>{assignment.completedQuestions}/{assignment.totalQuestions} questions</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="secondary"
                          className={`${getStatusColor(assignment.status)} text-white`}
                        >
                          <span className="flex items-center space-x-1">
                            {getStatusIcon(assignment.status)}
                            <span className="capitalize">{assignment.status.replace('-', ' ')}</span>
                          </span>
                        </Badge>
                        {assignment.score && (
                          <Badge variant="outline">
                            Score: {assignment.score}%
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round((assignment.completedQuestions / assignment.totalQuestions) * 100)}%</span>
                      </div>
                      <Progress 
                        value={(assignment.completedQuestions / assignment.totalQuestions) * 100}
                        className="h-2"
                      />
                    </div>

                    {/* Action Button */}
                    <div className="flex justify-end">
                      {assignment.status === 'completed' ? (
                        <Button variant="outline" size="sm">
                          Review Answers
                        </Button>
                      ) : (
                        <Button size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          {assignment.status === 'pending' ? 'Start Assignment' : 'Continue'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="solve">
            <Card>
              <CardHeader>
                <CardTitle>Solve Math Problems</CardTitle>
              </CardHeader>
              <CardContent>
                <StudentAssignmentView />
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
      </div>
    </div>
  );
};

export default StudentDashboard;
