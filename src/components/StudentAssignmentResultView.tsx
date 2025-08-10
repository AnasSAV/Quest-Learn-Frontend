import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Target,
  Trophy,
  Calendar,
  ArrowLeft,
  Award,
  TrendingUp,
  BookOpen,
  Star
} from 'lucide-react';
import { type StudentAssignment } from '@/services/student.api';
import { getQuestionImageUrl } from '@/lib/utils';

interface StudentAssignmentResultViewProps {
  assignment: StudentAssignment;
  onBack?: () => void;
}

const StudentAssignmentResultView = ({ assignment, onBack }: StudentAssignmentResultViewProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getOptionLetter = (option: 'A' | 'B' | 'C' | 'D') => {
    return option;
  };

  const getOptionText = (question: any, option: 'A' | 'B' | 'C' | 'D') => {
    switch (option) {
      case 'A': return question.option_a;
      case 'B': return question.option_b;
      case 'C': return question.option_c;
      case 'D': return question.option_d;
      default: return '';
    }
  };

  // Only show this component for submitted assignments
  if (assignment.student_status !== 'SUBMITTED') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Assignment Not Submitted</h3>
            <p className="text-muted-foreground mb-6">This assignment has not been submitted yet.</p>
            {onBack && (
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalQuestions = assignment.questions.length;
  const correctAnswers = assignment.questions.filter(q => q.is_correct).length;
  const totalTimeTaken = assignment.questions.reduce((acc, q) => acc + (q.time_taken_seconds || 0), 0);

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header with improved styling */}
      <div className="flex items-center justify-between bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center space-x-4">
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack} className="hover:scale-105 transition-transform">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">{assignment.title}</h1>
            <p className="text-gray-600 text-lg">{assignment.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-sm px-3 py-1 bg-green-500 text-white">
            Completed
          </Badge>
        </div>
      </div>

      {/* Enhanced Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Final Score</p>
                <p className="text-3xl font-bold">{assignment.percentage}%</p>
                <div className="flex items-center mt-2">
                  <Star className="h-4 w-4 mr-1" />
                  <span className="text-sm text-emerald-100">
                    {assignment.percentage >= 90 ? 'Excellent!' : 
                     assignment.percentage >= 80 ? 'Great job!' : 
                     assignment.percentage >= 70 ? 'Good work!' : 'Keep improving!'}
                  </span>
                </div>
              </div>
              <Trophy className="h-12 w-12 text-emerald-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Correct Answers</p>
                <p className="text-3xl font-bold">{correctAnswers}/{totalQuestions}</p>
                <p className="text-blue-100 text-sm mt-2">
                  {Math.round((correctAnswers / totalQuestions) * 100)}% correct
                </p>
              </div>
              <Target className="h-12 w-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Points Earned</p>
                <p className="text-3xl font-bold">{assignment.student_score}</p>
                <p className="text-purple-100 text-sm">out of {assignment.max_possible_score}</p>
              </div>
              <Award className="h-12 w-12 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Time Taken</p>
                <p className="text-3xl font-bold">{formatTime(totalTimeTaken)}</p>
                <p className="text-orange-100 text-sm">Total duration</p>
              </div>
              <Clock className="h-12 w-12 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Assignment Info */}
      <Card className="bg-white shadow-sm border-0 rounded-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl text-gray-900 flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
            Assignment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-500">Classroom</p>
                  <p className="font-semibold text-gray-900">{assignment.classroom_name}</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-red-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-500">Due Date</p>
                  <p className="font-semibold text-gray-900">{formatDate(assignment.due_at)}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-500">Submitted</p>
                  <p className="font-semibold text-gray-900">{assignment.submitted_at ? formatDate(assignment.submitted_at) : 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-500">Started</p>
                  <p className="font-semibold text-gray-900">{assignment.started_at ? formatDate(assignment.started_at) : 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Questions and Answers */}
      <Card className="bg-white shadow-sm border-0 rounded-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl text-gray-900 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
            Questions & Answers Review
          </CardTitle>
        </CardHeader>
        <CardContent className="max-h-[80vh] overflow-y-auto pr-4">
          <div className="space-y-8">
            {assignment.questions
              .sort((a, b) => a.order_index - b.order_index)
              .map((question, index) => (
                <div key={question.id} className="relative">
                  <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 space-y-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${question.is_correct ? 'bg-green-500' : 'bg-red-500'}`}>
                          {index + 1}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mt-1">
                          Question {index + 1}
                        </h3>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge 
                          variant={question.is_correct ? "default" : "destructive"}
                          className={`${question.is_correct ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"} text-white px-3 py-1`}
                        >
                          {question.is_correct ? (
                            <><CheckCircle className="h-4 w-4 mr-1" /> Correct</>
                          ) : (
                            <><XCircle className="h-4 w-4 mr-1" /> Incorrect</>
                          )}
                        </Badge>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          <Award className="h-3 w-3 mr-1" />
                          {question.points_earned}/{question.points} pts
                        </Badge>
                        {question.time_taken_seconds && (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTime(question.time_taken_seconds)}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                        <p className="text-gray-900 text-lg leading-relaxed">{question.prompt_text}</p>
                      </div>
                      
                      {question.image_key && (
                        <div className="flex justify-center">
                          <div className="bg-white p-4 rounded-lg shadow-sm border max-w-md">
                            <img 
                              src={getQuestionImageUrl(question.image_key)} 
                              alt="Question"
                              className="w-full h-auto rounded-lg"
                            />
                          </div>
                        </div>
                      )}

                      <div className="space-y-3">
                        {['A', 'B', 'C', 'D'].map((option) => {
                          const optionKey = option as 'A' | 'B' | 'C' | 'D';
                          const isChosen = question.chosen_option === optionKey;
                          const isCorrect = question.correct_option === optionKey;
                          
                          let cardClasses = 'p-4 rounded-xl border-2 transition-all duration-300 ';
                          let iconBg = '';
                          let icon = null;

                          if (isChosen && isCorrect) {
                            cardClasses += 'bg-green-50 border-green-300 shadow-md';
                            iconBg = 'bg-green-500 text-white';
                            icon = <CheckCircle className="h-4 w-4" />;
                          } else if (isChosen && !isCorrect) {
                            cardClasses += 'bg-red-50 border-red-300 shadow-md';
                            iconBg = 'bg-red-500 text-white';
                            icon = <XCircle className="h-4 w-4" />;
                          } else if (!isChosen && isCorrect) {
                            cardClasses += 'bg-green-50 border-green-200 shadow-sm';
                            iconBg = 'bg-green-500 text-white';
                            icon = <CheckCircle className="h-4 w-4" />;
                          } else {
                            cardClasses += 'bg-white border-gray-200';
                            iconBg = 'bg-gray-100 text-gray-600';
                          }

                          return (
                            <div key={option} className={cardClasses}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${iconBg}`}>
                                    {option}
                                  </div>
                                  <span className="text-gray-800 font-medium">
                                    {getOptionText(question, optionKey)}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {icon && (
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${iconBg}`}>
                                      {icon}
                                    </div>
                                  )}
                                  {isChosen && (
                                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                      Your Answer
                                    </Badge>
                                  )}
                                  {!isChosen && isCorrect && (
                                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                      Correct Answer
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {index < assignment.questions.length - 1 && (
                    <div className="flex justify-center my-8">
                      <Separator className="w-24 bg-gray-300" />
                    </div>
                  )}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentAssignmentResultView;
