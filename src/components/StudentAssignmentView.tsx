import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Image as ImageIcon } from 'lucide-react';
import { api, Assignment } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface SubmissionResult {
  assignmentId: string;
  isCorrect: boolean;
  correctAnswer?: string;
  studentAnswer: string;
}

const StudentAssignmentView = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submissionResults, setSubmissionResults] = useState<Record<string, SubmissionResult>>({});
  const [submittingIds, setSubmittingIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      const data = await api.getAssignments();
      setAssignments(data);
    } catch (error) {
      console.error('Error loading assignments:', error);
      toast({
        title: "Error loading assignments",
        description: "Please try refreshing the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (assignmentId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [assignmentId]: value
    }));
  };

  const handleSubmitAnswer = async (assignmentId: string) => {
    const answer = answers[assignmentId]?.trim();
    
    if (!answer) {
      toast({
        title: "Please enter an answer",
        description: "You must provide an answer before submitting.",
        variant: "destructive",
      });
      return;
    }

    setSubmittingIds(prev => new Set(prev).add(assignmentId));

    try {
      const result = await api.submitAnswer(assignmentId, answer);
      
      setSubmissionResults(prev => ({
        ...prev,
        [assignmentId]: {
          assignmentId,
          isCorrect: result.isCorrect,
          correctAnswer: result.correctAnswer,
          studentAnswer: answer
        }
      }));

      toast({
        title: result.isCorrect ? "Correct!" : "Incorrect",
        description: result.isCorrect 
          ? "Great job! Your answer is correct." 
          : `The correct answer is: ${result.correctAnswer}`,
        variant: result.isCorrect ? "default" : "destructive",
      });
      
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your answer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmittingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(assignmentId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-muted-foreground">Loading assignments...</div>
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="text-center py-12">
        <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No assignments available</h3>
        <p className="text-muted-foreground">Check back later for new assignments from your teacher.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground mb-6">Available Assignments</h2>
      
      {assignments.map((assignment) => {
        const result = submissionResults[assignment.id];
        const isSubmitting = submittingIds.has(assignment.id);
        const hasSubmitted = !!result;

        return (
          <Card key={assignment.id} className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Assignment {assignment.id}</span>
                {hasSubmitted && (
                  <Badge variant={result.isCorrect ? "default" : "destructive"} className="flex items-center gap-1">
                    {result.isCorrect ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )}
                    {result.isCorrect ? "Correct" : "Incorrect"}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4 bg-muted/50">
                <img
                  src={assignment.questionImage}
                  alt="Math question"
                  className="max-w-full h-auto rounded-lg shadow-sm"
                />
              </div>

              {hasSubmitted ? (
                <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Your answer:</span>
                    <span className="font-mono">{result.studentAnswer}</span>
                  </div>
                  {!result.isCorrect && result.correctAnswer && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-success">Correct answer:</span>
                      <span className="font-mono text-success">{result.correctAnswer}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter your answer..."
                    value={answers[assignment.id] || ''}
                    onChange={(e) => handleAnswerChange(assignment.id, e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSubmitAnswer(assignment.id);
                      }
                    }}
                    disabled={isSubmitting}
                  />
                  <Button
                    onClick={() => handleSubmitAnswer(assignment.id)}
                    disabled={isSubmitting || !answers[assignment.id]?.trim()}
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StudentAssignmentView;