import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Users,
  GraduationCap,
  BookOpen,
  Trophy,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Award,
  TrendingUp,
  User,
  Mail,
  Star,
  Eye,
  AlertTriangle,
  RefreshCw,
  BarChart3,
  FileText,
  Download
} from 'lucide-react';
import { teacherApi, type ComprehensiveReport, type StudentReport, type AssignmentResult } from '@/services/teacher.api';
import { getQuestionImageUrl } from '@/lib/utils';

const StudentManagementReport = () => {
  const [report, setReport] = useState<ComprehensiveReport | null>(null);
  const [selectedClassroom, setSelectedClassroom] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<StudentReport | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await teacherApi.getComprehensiveStudentReport();
      setReport(data);
    } catch (err: any) {
      console.error('Error fetching student report:', err);
      setError(err.response?.data?.message || 'Failed to load student report');
    } finally {
      setIsLoading(false);
    }
  };

  const getUniqueClassrooms = () => {
    if (!report) return [];
    const classrooms = new Set<string>();
    report.students.forEach(student => {
      student.classroom_enrollments.forEach(enrollment => {
        classrooms.add(enrollment.classroom_name);
      });
    });
    return Array.from(classrooms);
  };

  const getFilteredStudents = () => {
    if (!report) return [];
    if (selectedClassroom === 'all') return report.students;
    
    return report.students.filter(student =>
      student.classroom_enrollments.some(enrollment =>
        enrollment.classroom_name === selectedClassroom
      )
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceBadge = (percentage: number) => {
    if (percentage >= 90) return { label: 'Excellent', color: 'bg-green-500' };
    if (percentage >= 80) return { label: 'Good', color: 'bg-blue-500' };
    if (percentage >= 70) return { label: 'Average', color: 'bg-yellow-500' };
    return { label: 'Needs Improvement', color: 'bg-red-500' };
  };

  const handleViewStudent = (student: StudentReport) => {
    setSelectedStudent(student);
    setIsStudentDialogOpen(true);
  };

  const handleViewAssignment = (assignment: AssignmentResult) => {
    setSelectedAssignment(assignment);
    setIsAssignmentDialogOpen(true);
  };

  const handleExportReport = () => {
    // TODO: Implement export functionality
    console.log('Export report for classroom:', selectedClassroom);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading student report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={fetchReport}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-12">
        <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
        <p className="text-gray-600">Unable to load student report data.</p>
      </div>
    );
  }

  const filteredStudents = getFilteredStudents();
  const classrooms = getUniqueClassrooms();

  // Calculate overall stats
  const totalStudents = filteredStudents.length;
  const totalAssignments = filteredStudents.reduce((sum, student) => sum + student.statistics.total_assignments, 0);
  const totalCompleted = filteredStudents.reduce((sum, student) => sum + student.statistics.completed_assignments, 0);
  const averagePerformance = totalStudents > 0 
    ? filteredStudents.reduce((sum, student) => sum + student.statistics.overall_percentage, 0) / totalStudents
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Student Management Report</h2>
          <p className="text-gray-600 mt-1">Comprehensive overview of student performance and progress</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={selectedClassroom} onValueChange={setSelectedClassroom}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select classroom" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classrooms</SelectItem>
              {classrooms.map((classroom) => (
                <SelectItem key={classroom} value={classroom}>
                  {classroom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={fetchReport}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Students</p>
                <p className="text-3xl font-bold">{totalStudents}</p>
                <p className="text-blue-100 text-xs mt-1">
                  {selectedClassroom === 'all' ? 'All classrooms' : selectedClassroom}
                </p>
              </div>
              <Users className="h-12 w-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Assignments</p>
                <p className="text-3xl font-bold">{totalAssignments}</p>
                <p className="text-purple-100 text-xs mt-1">Total assigned</p>
              </div>
              <BookOpen className="h-12 w-12 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold">{totalCompleted}</p>
                <p className="text-green-100 text-xs mt-1">
                  {totalAssignments > 0 ? `${Math.round((totalCompleted / totalAssignments) * 100)}% completion` : 'No assignments'}
                </p>
              </div>
              <CheckCircle className="h-12 w-12 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Avg Performance</p>
                <p className="text-3xl font-bold">{Math.round(averagePerformance)}%</p>
                <p className="text-orange-100 text-xs mt-1">
                  {getPerformanceBadge(averagePerformance).label}
                </p>
              </div>
              <TrendingUp className="h-12 w-12 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students List */}
      <Card className="bg-white shadow-sm border-0 rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-500" />
            Students Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Students Found</h3>
              <p className="text-gray-600">
                {selectedClassroom === 'all' 
                  ? 'No students are enrolled in any classroom yet.'
                  : `No students found in ${selectedClassroom}.`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredStudents.map((student) => {
                const performanceBadge = getPerformanceBadge(student.statistics.overall_percentage);
                
                return (
                  <Card key={student.student_info.student_id} className="border border-gray-200 hover:shadow-md transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{student.student_info.student_name}</h3>
                              <Badge className={`${performanceBadge.color} text-white border-0`}>
                                {performanceBadge.label}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                              <Mail className="h-4 w-4" />
                              <span>{student.student_info.student_email}</span>
                              <span>•</span>
                              <Calendar className="h-4 w-4" />
                              <span>Joined {formatDate(student.student_info.created_at)}</span>
                            </div>
                            
                            {/* Classroom enrollments */}
                            <div className="flex flex-wrap gap-2 mb-4">
                              {student.classroom_enrollments.map((enrollment) => (
                                <Badge key={enrollment.classroom_id} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  {enrollment.classroom_name}
                                </Badge>
                              ))}
                            </div>

                            {/* Progress stats */}
                            <div className="grid grid-cols-4 gap-4 text-sm">
                              <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <BookOpen className="h-4 w-4 text-gray-500 mx-auto mb-1" />
                                <p className="font-semibold text-gray-900">{student.statistics.total_assignments}</p>
                                <p className="text-gray-600 text-xs">Assigned</p>
                              </div>
                              <div className="text-center p-3 bg-green-50 rounded-lg">
                                <CheckCircle className="h-4 w-4 text-green-500 mx-auto mb-1" />
                                <p className="font-semibold text-green-700">{student.statistics.completed_assignments}</p>
                                <p className="text-green-600 text-xs">Completed</p>
                              </div>
                              <div className="text-center p-3 bg-purple-50 rounded-lg">
                                <Award className="h-4 w-4 text-purple-500 mx-auto mb-1" />
                                <p className="font-semibold text-purple-700">{student.statistics.total_points_earned}</p>
                                <p className="text-purple-600 text-xs">Points</p>
                              </div>
                              <div className="text-center p-3 bg-orange-50 rounded-lg">
                                <Star className="h-4 w-4 text-orange-500 mx-auto mb-1" />
                                <p className={`font-semibold ${getPerformanceColor(student.statistics.overall_percentage)}`}>
                                  {Math.round(student.statistics.overall_percentage)}%
                                </p>
                                <p className="text-orange-600 text-xs">Average</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-6">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewStudent(student)}
                            className="hover:bg-blue-50 hover:border-blue-200"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Details Dialog */}
      <Dialog open={isStudentDialogOpen} onOpenChange={setIsStudentDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-500" />
              {selectedStudent?.student_info.student_name} - Detailed Report
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-8rem)] pr-4">
            {selectedStudent && (
              <div className="space-y-6">
                {/* Student Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Student Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-semibold">{selectedStudent.student_info.student_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-semibold">{selectedStudent.student_info.student_email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Student ID</p>
                        <p className="font-mono text-sm">{selectedStudent.student_info.student_id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Joined</p>
                        <p className="font-semibold">{formatDate(selectedStudent.student_info.created_at)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Assignments */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Assignment Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedStudent.assignment_results.map((assignment) => (
                        <Card key={assignment.assignment_id} className="border border-gray-200">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h4 className="font-semibold text-gray-900">{assignment.assignment_title}</h4>
                                  <Badge 
                                    variant={assignment.attempt_status === 'SUBMITTED' ? 'default' : 'secondary'}
                                    className={assignment.attempt_status === 'SUBMITTED' ? 'bg-green-500' : ''}
                                  >
                                    {assignment.attempt_status.replace('_', ' ')}
                                  </Badge>
                                  {assignment.percentage !== null && (
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                      {Math.round(assignment.percentage)}%
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mb-3">{assignment.assignment_description}</p>
                                <div className="grid grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <p className="text-gray-600">Questions</p>
                                    <p className="font-semibold">{assignment.total_questions}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">Max Score</p>
                                    <p className="font-semibold">{assignment.max_possible_score}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">Student Score</p>
                                    <p className="font-semibold">{assignment.student_score || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">Due Date</p>
                                    <p className="font-semibold">{formatDate(assignment.due_at)}</p>
                                  </div>
                                </div>
                              </div>
                              {assignment.attempt_status === 'SUBMITTED' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewAssignment(assignment)}
                                  className="ml-4"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Questions
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Assignment Details Dialog */}
      <Dialog open={isAssignmentDialogOpen} onOpenChange={setIsAssignmentDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-purple-500" />
              {selectedAssignment?.assignment_title} - Question Details
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-8rem)] pr-4">
            {selectedAssignment && (
              <div className="space-y-6">
                {selectedAssignment.question_details
                  .sort((a, b) => a.order_index - b.order_index)
                  .map((question, index) => (
                  <Card key={question.question_id} className="border border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">
                          Question {index + 1}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={question.status === 'CORRECT' ? 'default' : question.status === 'INCORRECT' ? 'destructive' : 'secondary'}
                            className={
                              question.status === 'CORRECT' ? 'bg-green-500' : 
                              question.status === 'INCORRECT' ? 'bg-red-500' : ''
                            }
                          >
                            {question.status === 'NOT_ATTEMPTED' ? 'Not Attempted' : question.status}
                          </Badge>
                          <Badge variant="outline">
                            {question.points} pts
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-gray-900">{question.question_text}</p>
                        </div>
                        
                        {question.image_key && (
                          <div className="flex justify-center">
                            <img 
                              src={getQuestionImageUrl(question.image_key)} 
                              alt="Question"
                              className="max-w-md w-full h-auto rounded-lg border"
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentManagementReport;
