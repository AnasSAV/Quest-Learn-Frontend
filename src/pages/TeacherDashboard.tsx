import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  Filter,
  Trash2,
  Edit,
  Calendar,
  Clock,
  TrendingUp,
  MoreVertical,
  AlertTriangle
} from 'lucide-react';
import TeacherUploadForm from '@/components/TeacherUploadForm';
import ClassroomManager from '@/components/ClassroomManager';
import CreateAssignmentForm from '@/components/CreateAssignmentForm';
import QuestionManager from '@/components/QuestionManager';
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
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [managingQuestionsForAssignment, setManagingQuestionsForAssignment] = useState<Assignment | null>(null);
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

  const handleDeleteAssignment = async (assignmentId: string) => {
    try {
      setIsDeleting(assignmentId);
      await teacherApi.deleteAssignment(assignmentId);

      // Remove the assignment from the list
      setAssignments(prev => prev.filter(assignment => assignment.id !== assignmentId));

      console.log('Assignment deleted successfully');
    } catch (error) {
      console.error('Error deleting assignment:', error);
      setError('Failed to delete assignment');
    } finally {
      setIsDeleting(null);
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

      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-4 gap-6 mb-8">
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
                      const isBeingDeleted = isDeleting === assignment.id;

                      return (
                        <Card key={assignment.id} className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            {/* Header Section with Classroom Name */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className="p-1 bg-blue-100 rounded">
                                  <FileText className="h-3 w-3 text-blue-600" />
                                </div>
                                <span className="text-sm font-medium text-blue-600">{assignment.classroom_name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={status.variant} className="text-xs">
                                  {status.text}
                                </Badge>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                      <MoreVertical className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => setManagingQuestionsForAssignment(assignment)}
                                    >
                                      <FileText className="h-4 w-4 mr-2" />
                                      Manage Questions
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit Assignment
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Download className="h-4 w-4 mr-2" />
                                      Export Results
                                    </DropdownMenuItem>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <DropdownMenuItem
                                          className="text-destructive focus:text-destructive"
                                          onSelect={(e) => e.preventDefault()}
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" />
                                          Delete Assignment
                                        </DropdownMenuItem>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle className="flex items-center gap-2">
                                            <AlertTriangle className="h-5 w-5 text-destructive" />
                                            Delete Assignment
                                          </AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Are you sure you want to delete "{assignment.title}"? This action cannot be undone.
                                            All student submissions and data for this assignment will be permanently removed.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleDeleteAssignment(assignment.id)}
                                            disabled={isBeingDeleted}
                                            className="bg-destructive hover:bg-destructive/90"
                                          >
                                            {isBeingDeleted ? (
                                              <div className="flex items-center gap-2">
                                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Deleting...
                                              </div>
                                            ) : (
                                              'Delete Assignment'
                                            )}
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>

                            {/* Title and Description */}
                            <div className="mb-3">
                              <h3 className="text-lg font-semibold text-foreground tracking-tight group-hover:text-primary transition-colors mb-1">
                                {assignment.title}
                              </h3>
                              <p className="text-sm text-muted-foreground/90 line-clamp-2">
                                {assignment.description}
                              </p>
                            </div>

                            {/* Stats and Dates Section */}
                            <div className="flex items-start justify-between gap-4">
                              {/* Stats in 2 columns */}
                              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-emerald-600/90" />
                                  <span>
                                    <span className="font-semibold">{assignment.unique_students_attempted}</span>
                                    <span className="text-muted-foreground ml-1">attempted</span>
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-blue-600/90" />
                                  <span>
                                    <span className="font-semibold">{assignment.completed_attempts}</span>
                                    <span className="text-muted-foreground ml-1">completed</span>
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <BarChart3 className="h-4 w-4 text-violet-600/90" />
                                  <span>
                                    <span className="font-semibold">
                                      {assignment.average_score !== null ? `${Math.round(assignment.average_score)}%` : 'N/A'}
                                    </span>
                                    <span className="text-muted-foreground ml-1">avg score</span>
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <TrendingUp className="h-4 w-4 text-orange-600/90" />
                                  <span>
                                    <span className="font-semibold">{assignment.total_questions}</span>
                                    <span className="text-muted-foreground ml-1">questions</span>
                                  </span>
                                </div>
                              </div>

                              {/* Dates on the right */}
                              <div className="text-right space-y-1 shrink-0">
                                <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                                  <Calendar className="h-3.5 w-3.5" />
                                  <span>Opens: <span className="text-foreground">{formatDate(assignment.opens_at)}</span></span>
                                </div>
                                <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                                  <Clock className="h-3.5 w-3.5" />
                                  <span>
                                    Due:{' '}
                                    <span
                                      className={[
                                        'px-1.5 py-0.5 rounded-md border',
                                        'text-foreground',
                                        // optional soft emphasis for due date; tweak logic if you have it
                                        // isOverdue ? 'border-destructive/40 bg-destructive/10 text-destructive' : 
                                        'border-border bg-muted/50'
                                      ].join(' ')}
                                    >
                                      {formatDate(assignment.due_at)}
                                    </span>
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-3 pt-3 border-t border-border/60">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="flex flex-col gap-1.5">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-[11px] sm:text-xs rounded-md">
                                      {assignment.completed_attempts}/{assignment.total_attempts} submissions
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      Created {formatDate(assignment.created_at)}
                                    </span>
                                  </div>

                                  {/* Tiny progress bar (no extra components) */}
                                  {typeof assignment.completed_attempts === 'number' && typeof assignment.total_attempts === 'number' && assignment.total_attempts > 0 && (
                                    <div className="h-1.5 w-full sm:w-56 rounded-full bg-muted overflow-hidden">
                                      <div
                                        className="h-full bg-primary transition-all"
                                        style={{
                                          width: `${Math.min(
                                            100,
                                            Math.round((assignment.completed_attempts / assignment.total_attempts) * 100)
                                          )}%`,
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <Button  onClick={() => setManagingQuestionsForAssignment(assignment)} variant="outline" size="sm" className="h-8 text-xs hover:border-foreground/30">
                                    <Eye className="h-3.5 w-3.5 mr-1" />
                                    View
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs border-primary/30 text-primary hover:bg-primary/10 hover:border-primary"
                                  >
                                    <BarChart3 className="h-3.5 w-3.5 mr-1" />
                                    Analytics
                                  </Button>
                                </div>
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

      {/* Question Manager Modal */}
      {managingQuestionsForAssignment && (
        <div className="fixed inset-0 bg-background z-50 overflow-auto">
          <div className="container mx-auto py-6">
            <QuestionManager
              assignment={managingQuestionsForAssignment}
              onClose={() => setManagingQuestionsForAssignment(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
