import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Target,
  Trophy,
  Calendar,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { studentApi, type AssignmentResult } from '@/services/student.api';
import { getQuestionImageUrl } from '@/lib/utils';

interface AssignmentResultViewProps {
  assignmentId: string;
  studentId: string;
  onBack?: () => void;
}

const AssignmentResultView = ({ assignmentId, studentId, onBack }: AssignmentResultViewProps) => {
  const [result, setResult] = useState<AssignmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAssignmentResult();
  }, [assignmentId, studentId]);

  const fetchAssignmentResult = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const resultData = await studentApi.getAssignmentResult(assignmentId, studentId);
      setResult(resultData);
    } catch (err: any) {
      console.error('Error fetching assignment result:', err);
      setError(err.response?.data?.message || 'Failed to load assignment results');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes < 1) {
      return `${Math.round(minutes * 60)} seconds`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} minutes`;
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (percentage: number) => {
    if (percentage >= 90) return 'default';
    if (percentage >= 70) return 'secondary';
    if (percentage >= 50) return 'outline';
    return 'destructive';
  };

  if (isLoading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading assignment results...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          {onBack && (
            <div className="mt-4 text-center">
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No results found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl mb-2">{result.assignment_title} - Results</CardTitle>
              <p className="text-muted-foreground">Student: {result.student_name}</p>
            </div>
            {onBack && (
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="h-6 w-6 text-yellow-500" />
              </div>
              <p className="text-sm text-muted-foreground">Final Score</p>
              <p className={`text-2xl font-bold ${getScoreColor(result.percentage)}`}>
                {result.percentage}%
              </p>
              <p className="text-xs text-muted-foreground">
                {result.total_score}/{result.max_possible_score} points
              </p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-6 w-6 text-blue-500" />
              </div>
              <p className="text-sm text-muted-foreground">Questions</p>
              <p className="text-2xl font-bold">
                {result.responses.filter(r => r.is_correct).length}/{result.responses.length}
              </p>
              <p className="text-xs text-muted-foreground">Correct</p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-6 w-6 text-purple-500" />
              </div>
              <p className="text-sm text-muted-foreground">Time Taken</p>
              <p className="text-2xl font-bold">{formatTime(result.time_taken_minutes)}</p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Calendar className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-sm text-muted-foreground">Submitted</p>
              <p className="text-sm font-medium">
                {new Date(result.submitted_at).toLocaleDateString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(result.submitted_at).toLocaleTimeString()}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <Badge variant={getScoreBadgeVariant(result.percentage)} className="text-lg px-4 py-2">
              {result.status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Question Results */}
      <Card>
        <CardHeader>
          <CardTitle>Question-by-Question Results</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-6">
              {result.responses
                .sort((a, b) => a.order_index - b.order_index)
                .map((response, index) => (
                <div key={response.question_id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">Question {index + 1}</Badge>
                      <Badge 
                        variant={response.is_correct ? 'default' : 'destructive'}
                        className="flex items-center space-x-1"
                      >
                        {response.is_correct ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        <span>{response.is_correct ? 'Correct' : 'Incorrect'}</span>
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {response.points_earned}/{response.max_points} points
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {response.time_taken_seconds}s
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">{response.prompt_text}</h4>
                      {response.image_key && (
                        <div className="mb-4">
                          <img 
                            src={getQuestionImageUrl(response.image_key)} 
                            alt="Question" 
                            className="max-w-full max-h-48 object-contain border rounded"
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {['A', 'B', 'C', 'D'].map((option) => {
                        const optionText = response[`option_${option.toLowerCase()}` as keyof typeof response] as string;
                        const isChosen = response.chosen_option === option;
                        const isCorrect = response.correct_option === option;
                        
                        let className = 'p-3 border rounded-lg text-sm';
                        
                        if (isCorrect && isChosen) {
                          // Chosen and correct
                          className += ' border-green-500 bg-green-50 text-green-800';
                        } else if (isCorrect && !isChosen) {
                          // Correct but not chosen
                          className += ' border-green-500 bg-green-100 text-green-700';
                        } else if (!isCorrect && isChosen) {
                          // Chosen but incorrect
                          className += ' border-red-500 bg-red-50 text-red-800';
                        } else {
                          // Not chosen and not correct
                          className += ' border-gray-200 bg-gray-50 text-gray-600';
                        }

                        return (
                          <div key={option} className={className}>
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center font-semibold text-xs">
                                {option}
                              </div>
                              <span className="flex-1">{optionText}</span>
                              {isChosen && (
                                <Badge variant="outline" className="text-xs">
                                  Your Answer
                                </Badge>
                              )}
                              {isCorrect && (
                                <Badge variant="outline" className="text-xs bg-green-100 text-green-700">
                                  Correct
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignmentResultView;
