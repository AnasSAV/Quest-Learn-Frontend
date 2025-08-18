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
  Timer,
  BookOpen,
  Award,
  Target,
  Zap,
  Brain,
  TrendingUp,
  Star
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
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);

  const currentQuestion = attemptData?.questions[currentQuestionIndex];

  // Timer effect
  useEffect(() => {
    if (!isStarted || !currentQuestion || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, currentQuestion, timeLeft]);

  // Reset selected option when changing questions
  useEffect(() => {
    if (currentQuestion) {
      const existingAnswer = answers.get(currentQuestion.id);
      setSelectedOption(existingAnswer?.chosen_option || null);
      setTimeLeft(currentQuestion.per_question_seconds);
      setQuestionStartTime(Date.now());
    }
  }, [currentQuestionIndex, currentQuestion, answers]);

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

  const handleAnswerSelect = (option: 'A' | 'B' | 'C' | 'D') => {
    setSelectedOption(option);
  };

  const handleNextQuestion = async () => {
    if (!currentQuestion || !attemptData) return;

    // Only save answer if an option was selected
    if (selectedOption) {
      const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
      const answerData: AnswerRequest = {
        question_id: currentQuestion.id,
        chosen_option: selectedOption,
        time_taken_seconds: timeSpent
      };

      try {
        // Submit answer to backend
        await studentApi.answerQuestion(attemptData.attempt_id, answerData);
        
        // Update local state
        setAnswers(prev => new Map(prev.set(currentQuestion.id, answerData)));
        
      } catch (err: any) {
        console.error('Error submitting answer:', err);
        setError('Failed to submit answer');
        return;
      }
    }

    // Move to next question
    if (currentQuestionIndex < attemptData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
    }
  };

  const handleSubmitAssignment = async () => {
    if (!attemptData) return;

    // Save current question answer if selected
    if (selectedOption && currentQuestion) {
      const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
      const answerData: AnswerRequest = {
        question_id: currentQuestion.id,
        chosen_option: selectedOption,
        time_taken_seconds: timeSpent
      };

      try {
        await studentApi.answerQuestion(attemptData.attempt_id, answerData);
        setAnswers(prev => new Map(prev.set(currentQuestion.id, answerData)));
      } catch (err: any) {
        console.error('Error submitting final answer:', err);
      }
    }

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  // Show results after submission
  if (submitResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-6">
        <Card className="max-w-2xl mx-auto bg-white shadow-2xl border-0 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center text-white">
            <div className="mx-auto mb-4 w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-3xl font-bold mb-2">Assignment Submitted!</CardTitle>
            <p className="text-green-100 text-lg">Congratulations on completing your assignment</p>
          </div>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <Star className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm text-blue-600 font-medium">Your Score</p>
                <p className="text-3xl font-bold text-blue-700">
                  {Math.round(submitResult.total_score * 100)}%
                </p>
                <p className="text-xs text-blue-500 mt-1">
                  {Math.round(submitResult.total_score * 100) >= 90 ? 'Excellent!' : 
                   Math.round(submitResult.total_score * 100) >= 80 ? 'Great job!' : 
                   Math.round(submitResult.total_score * 100) >= 70 ? 'Good work!' : 'Keep improving!'}
                </p>
              </div>
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                <Target className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <p className="text-sm text-purple-600 font-medium">Questions Answered</p>
                <p className="text-3xl font-bold text-purple-700">
                  {submitResult.questions_answered}/{submitResult.total_questions}
                </p>
                <p className="text-xs text-purple-500 mt-1">Complete</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 text-center space-y-3">
              <div className="flex items-center justify-center space-x-2">
                <Clock className="h-5 w-5 text-gray-500" />
                <p className="text-sm text-gray-600">
                  Submitted: {new Date(submitResult.submitted_at).toLocaleString()}
                </p>
              </div>
              {submitResult.is_late && (
                <Badge variant="destructive" className="bg-orange-500">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Late Submission
                </Badge>
              )}
            </div>

            <div className="text-center bg-blue-50 rounded-xl p-6">
              <BookOpen className="h-8 w-8 text-blue-500 mx-auto mb-3" />
              <p className="text-gray-700 mb-4 leading-relaxed">
                Your assignment has been successfully submitted. You can view detailed results and review your answers from the dashboard.
              </p>
            </div>

            {onCancel && (
              <div className="flex justify-center">
                <Button onClick={onCancel} size="lg" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show start screen before assignment begins
  if (!isStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <Card className="max-w-2xl mx-auto bg-white shadow-2xl border-0 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8 text-center text-white">
            <div className="mx-auto mb-4 w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <Play className="h-12 w-12 text-blue-500" />
            </div>
            <CardTitle className="text-3xl font-bold mb-2">Ready to Start?</CardTitle>
            <p className="text-blue-100 text-lg">Let's begin your math assignment</p>
          </div>
          <CardContent className="p-8 space-y-6">
            <div className="text-center space-y-4">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                <Brain className="h-8 w-8 text-green-500 mx-auto mb-3" />
                <p className="text-gray-700 font-medium mb-2">Get Ready to Show Your Skills!</p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Take your time, read each question carefully, and do your best. 
                  Remember, this is your chance to demonstrate what you've learned.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <Zap className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-blue-700">Stay Focused</p>
                  <p className="text-xs text-blue-600">Concentrate on each question</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <Timer className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-purple-700">Manage Time</p>
                  <p className="text-xs text-purple-600">Each question is timed</p>
                </div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-400">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-orange-500 mr-2" />
                  <p className="text-sm font-medium text-orange-700">Important:</p>
                </div>
                <p className="text-sm text-orange-600 mt-1">
                  Make sure you have a stable internet connection before starting.
                </p>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-center space-x-4">
              {onCancel && (
                <Button variant="outline" onClick={onCancel} size="lg" className="px-6">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              )}
              <Button 
                onClick={handleStartAssignment} 
                disabled={isLoading || !assignmentId}
                size="lg"
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Starting...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Assignment
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state
  if (!attemptData || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto bg-white shadow-lg border-0 rounded-2xl">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Questions</h3>
            <p className="text-gray-600">Please wait while we prepare your assignment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isLastQuestion = currentQuestionIndex === attemptData.questions.length - 1;

  return (
    <div className="space-y-4">
        {/* Enhanced header with progress and timer */}
        <Card className="bg-white shadow-lg border-0 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
            <div className="flex justify-between items-center text-white">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-blue-100 text-xs">Question Progress</p>
                    <p className="font-semibold text-base">
                      {currentQuestionIndex + 1} of {attemptData.questions.length}
                    </p>
                  </div>
                </div>
                <div className="w-56">
                  <Progress 
                    value={((currentQuestionIndex + 1) / attemptData.questions.length) * 100}
                    className="h-2 bg-blue-400 bg-opacity-30"
                  />
                </div>
              </div>
              <div className="text-right space-y-2">
                <div className="flex items-center justify-end space-x-2">
                  <Timer className={`h-4 w-4 ${timeLeft <= 10 ? 'text-red-300' : 'text-blue-200'}`} />
                  <span className={`font-mono text-xl font-bold ${timeLeft <= 10 ? 'text-red-200' : 'text-white'}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <div className="flex items-center justify-end space-x-2">
                  <Award className="h-3.5 w-3.5 text-blue-200" />
                  <Badge variant="secondary" className="bg-white bg-opacity-20 text-white border-0 text-xs py-0.5">
                    {currentQuestion.points} point{currentQuestion.points !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          
          {/* Time warning */}
          {timeLeft <= 10 && timeLeft > 0 && (
            <div className="bg-red-500 text-white px-4 py-2">
              <div className="flex items-center justify-center space-x-2">
                <AlertCircle className="h-4 w-4 animate-pulse" />
                <span className="font-medium text-sm">Time is running out! {timeLeft} seconds remaining</span>
              </div>
            </div>
          )}
        </Card>

        {/* Enhanced Question Card */}
        <Card className="bg-white shadow-lg border-0 rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-100 p-4">
            <div className="flex items-start space-x-3">
              <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-base">
                {currentQuestionIndex + 1}
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg text-gray-900 leading-relaxed">
                  {currentQuestion.prompt_text}
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {/* Question Image */}
            {currentQuestion.image_key && (
              <div className="flex justify-center">
                <div className="bg-gray-50 p-3 rounded-xl shadow-sm border max-w-xl">
                  <img 
                    src={getQuestionImageUrl(currentQuestion.image_key)} 
                    alt="Question" 
                    className="w-full h-auto object-contain rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* Enhanced Options */}
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Choose your answer:</h3>
              {['A', 'B', 'C', 'D'].map((option) => {
                const optionKey = option as 'A' | 'B' | 'C' | 'D';
                const isSelected = selectedOption === optionKey;
                
                return (
                  <div 
                    key={option}
                    className={`group p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-md ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50 shadow-md transform scale-[1.01]' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => handleAnswerSelect(optionKey)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold transition-colors ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-500 text-white' 
                          : 'border-gray-300 text-gray-600 group-hover:border-blue-400'
                      }`}>
                        {option}
                      </div>
                      <span className={`text-base ${isSelected ? 'text-blue-700 font-medium' : 'text-gray-800'}`}>
                        {getOptionText(currentQuestion, optionKey)}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="mt-2 flex items-center text-blue-600 text-xs">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Selected
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {error && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Navigation */}
        <Card className="bg-white shadow-lg border-0 rounded-2xl">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center space-x-2 text-xs text-gray-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>{answers.size} of {attemptData.questions.length} answered</span>
                </div>
                <Progress 
                  value={(answers.size / attemptData.questions.length) * 100} 
                  className="w-28 h-1.5"
                />
              </div>

              <div className="flex space-x-3">
                {!isLastQuestion && (
                  <Button
                    onClick={handleNextQuestion}
                    disabled={!selectedOption}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-5"
                  >
                    Next Question
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
                
                <Button
                  onClick={handleSubmitAssignment}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-5"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Assignment
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
    </div>
  );
};

export default StudentAssignmentView;
