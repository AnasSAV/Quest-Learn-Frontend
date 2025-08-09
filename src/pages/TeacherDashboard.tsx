import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  UploadCloud, 
  Users, 
  FileText, 
  BarChart3, 
  LogOut,
  Plus,
  Eye,
  Download,
  RefreshCw,
  Filter
} from 'lucide-react';
import TeacherUploadForm from '@/components/TeacherUploadForm';
import ClassroomManager from '@/components/ClassroomManager';
import CreateAssignmentForm from '@/components/CreateAssignmentForm';
import { authApi } from '@/services/auth.api';
import { teacherApi, type Assignment } from '@/services/teacher.api';

const TeacherDashboard = () => {
  const [userEmail, setUserEmail] = useState('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('assignments');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    const currentUser = authApi.getCurrentUser();

    if (!currentUser || currentUser.role !== 'TEACHER') {
      navigate('/login');
      return;
    }

    // Get the email from localStorage (set during login)
    const email = localStorage.getItem('userEmail');
    setUserEmail(email || '');

    // Fetch assignments
    fetchAssignments();
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

  const fetchAssignments = async () => {
    try {
      setIsLoading(true);
      const assignmentsData = await teacherApi.getAllAssignments();
      setAssignments(assignmentsData);
      setError('');
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError('Failed to load assignments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClassroomSelect = (classroomId: string | null) => {
    setSelectedClassroomId(classroomId);
  };

  const handleCreateAssignment = () => {
    setActiveTab('create');
  };

  const handleAssignmentCreated = (newAssignment: Assignment) => {
    // Add the new assignment to the list and refresh the view
    setAssignments(prev => [newAssignment, ...prev]);
    // Show a success message (you can add a toast notification here)
    console.log('Assignment created successfully:', newAssignment);
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

  // Calculate stats from filtered assignments data
  const stats = {
    totalAssignments: filteredAssignments.length,
    activeStudents: filteredAssignments.reduce((sum, assignment) => sum + assignment.unique_students_attempted, 0),
    completedSubmissions: filteredAssignments.reduce((sum, assignment) => sum + assignment.completed_attempts, 0),
    averageScore: filteredAssignments.length > 0 ? 
      Math.round(filteredAssignments.reduce((sum, assignment) => sum + (assignment.average_score || 0), 0) / filteredAssignments.length) : 0
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = (assignment: Assignment) => {
    const now = new Date();
    const opensAt = new Date(assignment.opens_at);
    const dueAt = new Date(assignment.due_at);
    
    if (now < opensAt) {
      return { text: 'Upcoming', variant: 'secondary' as const };
    } else if (now > dueAt) {
      return { text: 'Closed', variant: 'destructive' as const };
    } else {
      return { text: 'Active', variant: 'default' as const };
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-foreground">Teacher Dashboard</h1>
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
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Students</p>
                  <p className="text-2xl font-bold text-foreground">{stats.activeStudents}</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Submissions</p>
                  <p className="text-2xl font-bold text-foreground">{stats.completedSubmissions}</p>
                </div>
                <UploadCloud className="h-8 w-8 text-purple-500" />
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
                <BarChart3 className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="create">Create Assignment</TabsTrigger>
            <TabsTrigger value="classrooms">Classrooms</TabsTrigger>
            <TabsTrigger value="upload">Upload New</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
          </TabsList>

          <TabsContent value="assignments" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Classroom Filter Sidebar */}
              <div className="lg:col-span-1">
                <ClassroomManager 
                  onClassroomSelect={handleClassroomSelect}
                  selectedClassroomId={selectedClassroomId}
                />
              </div>

              {/* Assignments Content */}
              <div className="lg:col-span-3 space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      {selectedClassroomId ? 'Classroom Assignments' : 'All Assignments'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedClassroomId 
                        ? `Showing ${filteredAssignments.length} assignments`
                        : `Showing all ${assignments.length} assignments`
                      }
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={fetchAssignments}
                      disabled={isLoading}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                    <Button onClick={handleCreateAssignment}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Assignment
                    </Button>
                  </div>
                </div>

                {error && (
                  <div className="text-center py-8">
                    <p className="text-destructive">{error}</p>
                    <Button onClick={fetchAssignments} variant="outline" className="mt-4">
                      Retry
                    </Button>
                  </div>
                )}

                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading assignments...</p>
                  </div>
                ) : filteredAssignments.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {selectedClassroomId ? 'No Assignments in This Classroom' : 'No Assignments Yet'}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {selectedClassroomId 
                        ? 'This classroom doesn\'t have any assignments yet.'
                        : 'Create your first assignment to get started.'
                      }
                    </p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Assignment
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {filteredAssignments.map((assignment) => {
                      const status = getStatusBadge(assignment);
                      return (
                        <Card key={assignment.id}>
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-3">
                                  <h3 className="text-lg font-semibold text-foreground">{assignment.title}</h3>
                                  <Badge variant={status.variant}>
                                    {status.text}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{assignment.description}</p>
                                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                  <span>📚 {assignment.classroom_name}</span>
                                  <span>👥 {assignment.unique_students_attempted} students attempted</span>
                                  <span>📝 {assignment.completed_attempts} completed</span>
                                  <span>❓ {assignment.total_questions} questions</span>
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                  <span>Opens: {formatDate(assignment.opens_at)}</span>
                                  <span>Due: {formatDate(assignment.due_at)}</span>
                                  {assignment.average_score !== null && (
                                    <span>Avg Score: {Math.round(assignment.average_score)}%</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 ml-4">
                                <Badge variant="secondary">
                                  {assignment.completed_attempts}/{assignment.total_attempts} submissions
                                </Badge>
                                <Button variant="outline" size="sm">
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Download className="h-4 w-4 mr-2" />
                                  Export
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="create">
            <CreateAssignmentForm 
              onAssignmentCreated={handleAssignmentCreated}
              selectedClassroomId={selectedClassroomId}
            />
          </TabsContent>

          <TabsContent value="classrooms">
            <ClassroomManager 
              onClassroomSelect={handleClassroomSelect}
              selectedClassroomId={selectedClassroomId}
            />
          </TabsContent>

          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>Upload New Assignment</CardTitle>
              </CardHeader>
              <CardContent>
                <TeacherUploadForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics & Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Analytics Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Detailed analytics and reporting features will be available here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>Student Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Student Management Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Student management and class organization features will be available here.
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

export default TeacherDashboard;
