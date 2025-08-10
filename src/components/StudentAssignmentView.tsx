import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight,
  Play,
  Send,
  Timer
} from 'lucide-react';
import { 
  studentApi, 
  type AttemptQuestion, 
  type StartAttemptResponse,
  type AnswerRequest,
  type SubmitAttemptResponse
} from '@/services/student.api';
import { getQuestionImageUrl } from '@/lib/utils';

interface StudentAssignmentViewProps {
  assignmentId?: string;
  onComplete?: (result: SubmitAttemptResponse) => void;
  onCancel?: () => void;
}

const StudentAssignmentView = ({ assignmentId, onComplete, onCancel }: StudentAssignmentViewProps) => {
  const [attemptData, setAttemptData] = useState<StartAttemptResponse | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, AnswerRequest>>(new Map());
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [submitResult, setSubmitResult] = useState<SubmitAttemptResponse | null>(null);

  const currentQuestion = attemptData?.questions[currentQuestionIndex];

  // Timer effect
  useEffect(() => {
    if (!isStarted || !currentQuestion || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up for this question, move to next
          handleAutoNextQuestion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, currentQuestion, timeLeft]);

  const handleStartAssignment = async () => {
    if (!assignmentId) {
      setError('No assignment selected');
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      const result = await studentApi.startAssignment(assignmentId);
      setAttemptData(result);
      setIsStarted(true);
      
      // Initialize timer for first question
      if (result.questions.length > 0) {
        setTimeLeft(result.questions[0].per_question_seconds);
        setQuestionStartTime(Date.now());
      }
    } catch (err: any) {
      console.error('Error starting assignment:', err);
      setError(err.response?.data?.message || 'Failed to start assignment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = async (option: 'A' | 'B' | 'C' | 'D') => {
    if (!currentQuestion || !attemptData) return;

    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    const answerData: AnswerRequest = {
      question_id: currentQuestion.id,
      chosen_option: option,
      time_taken_seconds: timeSpent
    };

    try {
      // Submit answer to backend
      await studentApi.answerQuestion(attemptData.attempt_id, answerData);
      
      // Update local state
      setAnswers(prev => new Map(prev.set(currentQuestion.id, answerData)));
      
      // Move to next question after a brief delay
      setTimeout(() => {
        handleNextQuestion();
      }, 500);
      
    } catch (err: any) {
      console.error('Error submitting answer:', err);
      setError('Failed to submit answer');
    }
  };

  const handleAutoNextQuestion = useCallback(() => {
    if (!currentQuestion || !attemptData) return;

    // Auto-submit empty answer if time runs out
    const timeSpent = currentQuestion.per_question_seconds;
    const answerData: AnswerRequest = {
      question_id: currentQuestion.id,
      chosen_option: 'A', // Default answer when time runs out
      time_taken_seconds: timeSpent
    };

    studentApi.answerQuestion(attemptData.attempt_id, answerData).catch(console.error);
    setAnswers(prev => new Map(prev.set(currentQuestion.id, answerData)));
    
    handleNextQuestion();
  }, [currentQuestion, attemptData]);

  const handleNextQuestion = () => {
    if (!attemptData) return;

    if (currentQuestionIndex < attemptData.questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setTimeLeft(attemptData.questions[nextIndex].per_question_seconds);
      setQuestionStartTime(Date.now());
    } else {
      // All questions answered, submit assignment
      handleSubmitAssignment();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
      setTimeLeft(attemptData!.questions[prevIndex].per_question_seconds);
      setQuestionStartTime(Date.now());
    }
  };

  const handleSubmitAssignment = async () => {
    if (!attemptData) return;

    try {
      setIsSubmitting(true);
      setError('');
      
      const result = await studentApi.submitAttempt(attemptData.attempt_id);
      setSubmitResult(result);
      
      if (onComplete) {
        onComplete(result);
      }
    } catch (err: any) {
      console.error('Error submitting assignment:', err);
      setError(err.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getOptionClass = (option: 'A' | 'B' | 'C' | 'D') => {
    const answer = currentQuestion ? answers.get(currentQuestion.id) : null;
    const isSelected = answer?.chosen_option === option;
    
    return `p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
      isSelected 
        ? 'border-blue-500 bg-blue-50 text-blue-700' 
        : 'border-gray-200 hover:border-gray-300'
    }`;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Show results after submission
  if (submitResult) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Assignment Submitted!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Score</p>
              <p className="text-2xl font-bold text-green-600">
                {Math.round(submitResult.total_score * 100)}%
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Questions Answered</p>
              <p className="text-2xl font-bold">
                {submitResult.questions_answered}/{submitResult.total_questions}
              </p>
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Submitted: {new Date(submitResult.submitted_at).toLocaleString()}
            </p>
            {submitResult.is_late && (
              <Badge variant="destructive">Late Submission</Badge>
            )}
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Your assignment has been successfully submitted. You can view detailed results from the dashboard.
            </p>
          </div>

          {onCancel && (
            <div className="flex justify-center">
              <Button onClick={onCancel}>Back to Dashboard</Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Show start screen before assignment begins
  if (!isStarted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Play className="h-16 w-16 text-blue-500" />
          </div>
          <CardTitle className="text-2xl">Ready to Start?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">
              Click the button below when you're ready to begin your assignment.
            </p>
            <p className="text-sm text-muted-foreground">
              Make sure you have a stable internet connection.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-center space-x-2">
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button 
              onClick={handleStartAssignment} 
              disabled={isLoading || !assignmentId}
              size="lg"
            >
              {isLoading ? 'Starting...' : 'Start Assignment'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show loading state
  if (!attemptData || !currentQuestion) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Loading questions...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with progress and timer */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Question {currentQuestionIndex + 1} of {attemptData.questions.length}
              </p>
              <Progress 
                value={((currentQuestionIndex + 1) / attemptData.questions.length) * 100}
                className="w-48"
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Timer className="h-4 w-4 text-orange-500" />
                <span className={`font-mono text-lg ${timeLeft <= 10 ? 'text-red-500' : 'text-foreground'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <Badge variant={timeLeft <= 10 ? 'destructive' : 'secondary'}>
                {currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{currentQuestion.prompt_text}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Question Image */}
          {currentQuestion.image_key && (
            <div className="flex justify-center">
              <img 
                src={getQuestionImageUrl(currentQuestion.image_key)} 
                alt="Question" 
                className="max-w-full max-h-96 object-contain border rounded-lg"
              />
            </div>
          )}

          {/* Options */}
          <div className="space-y-3">
            <div 
              className={getOptionClass('A')}
              onClick={() => handleAnswerSelect('A')}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center font-semibold">
                  A
                </div>
                <span>{currentQuestion.option_a}</span>
              </div>
            </div>
            
            <div 
              className={getOptionClass('B')}
              onClick={() => handleAnswerSelect('B')}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center font-semibold">
                  B
                </div>
                <span>{currentQuestion.option_b}</span>
              </div>
            </div>
            
            <div 
              className={getOptionClass('C')}
              onClick={() => handleAnswerSelect('C')}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center font-semibold">
                  C
                </div>
                <span>{currentQuestion.option_c}</span>
              </div>
            </div>
            
            <div 
              className={getOptionClass('D')}
              onClick={() => handleAnswerSelect('D')}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center font-semibold">
                  D
                </div>
                <span>{currentQuestion.option_d}</span>
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="text-sm text-muted-foreground">
              {answers.size} of {attemptData.questions.length} answered
            </div>

            {currentQuestionIndex === attemptData.questions.length - 1 ? (
              <Button
                onClick={handleSubmitAssignment}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                disabled={!answers.has(currentQuestion.id)}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentAssignmentView;
