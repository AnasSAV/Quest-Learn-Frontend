import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Target,
  Trophy,
  Calendar,
  ArrowLeft
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
      <div className="p-6 text-center">
        <p className="text-muted-foreground">This assignment has not been submitted yet.</p>
        {onBack && (
          <Button variant="outline" onClick={onBack} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
      </div>
    );
  }

  const totalQuestions = assignment.questions.length;
  const correctAnswers = assignment.questions.filter(q => q.is_correct).length;
  const totalTimeTaken = assignment.questions.reduce((acc, q) => acc + (q.time_taken_seconds || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <h2 className="text-2xl font-bold text-foreground">{assignment.title}</h2>
            <p className="text-muted-foreground">{assignment.description}</p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Final Score</p>
                <p className="text-2xl font-bold text-foreground">{assignment.percentage}%</p>
              </div>
              <Trophy className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Correct Answers</p>
                <p className="text-2xl font-bold text-foreground">{correctAnswers}/{totalQuestions}</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Points Earned</p>
                <p className="text-2xl font-bold text-foreground">{assignment.student_score}/{assignment.max_possible_score}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Time Taken</p>
                <p className="text-2xl font-bold text-foreground">{formatTime(totalTimeTaken)}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignment Info */}
      <Card>
        <CardHeader>
          <CardTitle>Assignment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Classroom:</span> {assignment.classroom_name}
            </div>
            <div>
              <span className="font-medium">Due Date:</span> {formatDate(assignment.due_at)}
            </div>
            <div>
              <span className="font-medium">Submitted:</span> {assignment.submitted_at ? formatDate(assignment.submitted_at) : 'N/A'}
            </div>
            <div>
              <span className="font-medium">Started:</span> {assignment.started_at ? formatDate(assignment.started_at) : 'N/A'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions and Answers */}
      <Card>
        <CardHeader>
          <CardTitle>Questions & Answers</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6">
              {assignment.questions
                .sort((a, b) => a.order_index - b.order_index)
                .map((question, index) => (
                <div key={question.id} className="space-y-4">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-foreground">
                      Question {index + 1}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={question.is_correct ? "default" : "destructive"}
                        className={question.is_correct ? "bg-green-500" : "bg-red-500"}
                      >
                        {question.is_correct ? (
                          <><CheckCircle className="h-3 w-3 mr-1" /> Correct</>
                        ) : (
                          <><XCircle className="h-3 w-3 mr-1" /> Incorrect</>
                        )}
                      </Badge>
                      <Badge variant="outline">
                        {question.points_earned}/{question.points} pts
                      </Badge>
                      {question.time_taken_seconds && (
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTime(question.time_taken_seconds)}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-foreground">{question.prompt_text}</p>
                    
                    {question.image_key && (
                      <div className="max-w-md">
                        <img 
                          src={getQuestionImageUrl(question.image_key)} 
                          alt="Question"
                          className="w-full h-auto rounded-lg border"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      {['A', 'B', 'C', 'D'].map((option) => {
                        const optionKey = option as 'A' | 'B' | 'C' | 'D';
                        const isChosen = question.chosen_option === optionKey;
                        const isCorrect = question.correct_option === optionKey;
                        
                        let bgColor = '';
                        let textColor = '';
                        let icon = null;

                        if (isChosen && isCorrect) {
                          bgColor = 'bg-green-100 border-green-500';
                          textColor = 'text-green-800';
                          icon = <CheckCircle className="h-4 w-4 text-green-600" />;
                        } else if (isChosen && !isCorrect) {
                          bgColor = 'bg-red-100 border-red-500';
                          textColor = 'text-red-800';
                          icon = <XCircle className="h-4 w-4 text-red-600" />;
                        } else if (!isChosen && isCorrect) {
                          bgColor = 'bg-green-50 border-green-300';
                          textColor = 'text-green-700';
                          icon = <CheckCircle className="h-4 w-4 text-green-500" />;
                        }

                        return (
                          <div 
                            key={option}
                            className={`p-3 rounded-lg border-2 ${bgColor || 'bg-gray-50 border-gray-200'}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <span className={`font-bold ${textColor || 'text-gray-600'}`}>
                                  {option}.
                                </span>
                                <span className={textColor || 'text-gray-800'}>
                                  {getOptionText(question, optionKey)}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                {icon}
                                {isChosen && (
                                  <Badge variant="outline" className="text-xs">
                                    Your Answer
                                  </Badge>
                                )}
                                {!isChosen && isCorrect && (
                                  <Badge variant="outline" className="text-xs bg-green-50">
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

                  {index < assignment.questions.length - 1 && (
                    <Separator className="my-6" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentAssignmentResultView;
