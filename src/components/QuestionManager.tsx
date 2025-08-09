import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Trash2, 
  Upload, 
  X, 
  Image as ImageIcon, 
  Clock, 
  Star,
  Edit,
  Save
} from 'lucide-react';
import { questionApi, type Question, type CreateQuestionRequest } from '@/services/question.api';
import { type Assignment } from '@/services/teacher.api';
import { getQuestionImageUrl } from '@/lib/utils';

interface QuestionManagerProps {
  assignment: Assignment;
  onClose: () => void;
}

const QuestionManager = ({ assignment, onClose }: QuestionManagerProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateQuestionRequest>({
    assignment_id: assignment.id,
    prompt_text: '',
    image_key: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'A',
    per_question_seconds: 30,
    points: 1,
    order_index: 0
  });

  // Image upload state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImageKey, setUploadedImageKey] = useState<string>('');

  useEffect(() => {
    fetchQuestions();
  }, [assignment.id]);

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      const questionsData = await questionApi.getQuestions(assignment.id);
      setQuestions(Array.isArray(questionsData) ? questionsData : []);
      setError('');
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError('Failed to load questions');
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (2MB = 2 * 1024 * 1024 bytes)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be less than 2MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/png')) {
      setError('Only PNG images are allowed');
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setError('');
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;

    try {
      setIsUploading(true);
      const uploadResult = await questionApi.uploadQuestionImage(selectedImage);
      setUploadedImageKey(uploadResult.image_key);
      setFormData(prev => ({ ...prev, image_key: uploadResult.image_key }));
      setError('');
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (uploadedImageKey) {
      try {
        await questionApi.deleteQuestionImage(uploadedImageKey);
      } catch (err) {
        console.error('Error deleting image:', err);
      }
    }
    
    setSelectedImage(null);
    setImagePreview('');
    setUploadedImageKey('');
    setFormData(prev => ({ ...prev, image_key: '' }));
  };

  const handleInputChange = (field: keyof CreateQuestionRequest, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.prompt_text.trim()) {
      setError('Question prompt is required');
      return;
    }

    if (!formData.option_a.trim() || !formData.option_b.trim() || 
        !formData.option_c.trim() || !formData.option_d.trim()) {
      setError('All options are required');
      return;
    }

    try {
      setIsCreating(true);
      
      // Set order index to be the next available
      const questionData = {
        ...formData,
        order_index: questions.length
      };

      const newQuestion = await questionApi.createQuestion(questionData);
      setQuestions(prev => [...prev, newQuestion]);
      
      // Reset form
      setFormData({
        assignment_id: assignment.id,
        prompt_text: '',
        image_key: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_option: 'A',
        per_question_seconds: 30,
        points: 1,
        order_index: 0
      });
      
      handleRemoveImage();
      setIsDialogOpen(false);
      setError('');
    } catch (err: any) {
      console.error('Error creating question:', err);
      setError(err.response?.data?.message || 'Failed to create question');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      await questionApi.deleteQuestion(questionId);
      setQuestions(prev => prev.filter(q => q.id !== questionId));
    } catch (err) {
      console.error('Error deleting question:', err);
      setError('Failed to delete question');
    }
  };

  const getOptionStyle = (option: string, correctOption: string) => {
    return option === correctOption 
      ? 'border-green-500 bg-green-50 text-green-800' 
      : 'border-gray-200 bg-gray-50';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Manage Questions</h2>
          <p className="text-muted-foreground">Assignment: {assignment.title}</p>
          <p className="text-sm text-muted-foreground">
            {questions.length} question{questions.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Question</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateQuestion} className="space-y-4">
                {/* Question Prompt */}
                <div className="space-y-2">
                  <Label htmlFor="prompt">Question Prompt *</Label>
                  <Textarea
                    id="prompt"
                    value={formData.prompt_text}
                    onChange={(e) => handleInputChange('prompt_text', e.target.value)}
                    placeholder="Enter the question text..."
                    rows={3}
                    required
                  />
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label>Question Image (Optional)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    {imagePreview ? (
                      <div className="space-y-2">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="max-w-full h-48 object-contain mx-auto"
                        />
                        <div className="flex justify-center space-x-2">
                          {!uploadedImageKey && (
                            <Button
                              type="button"
                              onClick={handleImageUpload}
                              disabled={isUploading}
                              size="sm"
                            >
                              {isUploading ? 'Uploading...' : 'Upload Image'}
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleRemoveImage}
                            size="sm"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                        {uploadedImageKey && (
                          <p className="text-sm text-green-600 text-center">
                            ✓ Image uploaded successfully
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 mb-2">
                          Upload a PNG image (max 2MB)
                        </p>
                        <input
                          type="file"
                          accept=".png"
                          onChange={handleImageSelect}
                          className="hidden"
                          id="image-upload"
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => document.getElementById('image-upload')?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Select Image
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Options */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="option_a">Option A *</Label>
                    <Input
                      id="option_a"
                      value={formData.option_a}
                      onChange={(e) => handleInputChange('option_a', e.target.value)}
                      placeholder="Enter option A"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="option_b">Option B *</Label>
                    <Input
                      id="option_b"
                      value={formData.option_b}
                      onChange={(e) => handleInputChange('option_b', e.target.value)}
                      placeholder="Enter option B"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="option_c">Option C *</Label>
                    <Input
                      id="option_c"
                      value={formData.option_c}
                      onChange={(e) => handleInputChange('option_c', e.target.value)}
                      placeholder="Enter option C"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="option_d">Option D *</Label>
                    <Input
                      id="option_d"
                      value={formData.option_d}
                      onChange={(e) => handleInputChange('option_d', e.target.value)}
                      placeholder="Enter option D"
                      required
                    />
                  </div>
                </div>

                {/* Correct Option */}
                <div className="space-y-2">
                  <Label>Correct Answer *</Label>
                  <Select
                    value={formData.correct_option}
                    onValueChange={(value: 'A' | 'B' | 'C' | 'D') => 
                      handleInputChange('correct_option', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A - {formData.option_a || 'Option A'}</SelectItem>
                      <SelectItem value="B">B - {formData.option_b || 'Option B'}</SelectItem>
                      <SelectItem value="C">C - {formData.option_c || 'Option C'}</SelectItem>
                      <SelectItem value="D">D - {formData.option_d || 'Option D'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Time and Points */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="time">Time Limit (seconds)</Label>
                    <Input
                      id="time"
                      type="number"
                      min="1"
                      max="300"
                      value={formData.per_question_seconds}
                      onChange={(e) => handleInputChange('per_question_seconds', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="points">Points</Label>
                    <Input
                      id="points"
                      type="number"
                      min="1"
                      max="10"
                      value={formData.points}
                      onChange={(e) => handleInputChange('points', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isCreating || (selectedImage && !uploadedImageKey)}
                  >
                    {isCreating ? 'Creating...' : 'Create Question'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {/* Questions List */}
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading questions...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Questions Yet</h3>
          <p className="text-muted-foreground mb-4">
            Add your first question to this assignment.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question, index) => (
            <Card key={question.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">Question {index + 1}</Badge>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{question.per_question_seconds}s</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Star className="h-4 w-4" />
                      <span>{question.points} pt{question.points !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteQuestion(question.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">{question.prompt_text}</h4>
                  {question.image_key && (
                    <div className="mb-4">
                      <img 
                        src={getQuestionImageUrl(question.image_key)} 
                        alt="Question" 
                        className="max-w-full h-48 object-contain border rounded"
                      />
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className={`p-2 rounded border ${getOptionStyle('A', question.correct_option)}`}>
                    <span className="font-semibold">A.</span> {question.option_a}
                  </div>
                  <div className={`p-2 rounded border ${getOptionStyle('B', question.correct_option)}`}>
                    <span className="font-semibold">B.</span> {question.option_b}
                  </div>
                  <div className={`p-2 rounded border ${getOptionStyle('C', question.correct_option)}`}>
                    <span className="font-semibold">C.</span> {question.option_c}
                  </div>
                  <div className={`p-2 rounded border ${getOptionStyle('D', question.correct_option)}`}>
                    <span className="font-semibold">D.</span> {question.option_d}
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Correct Answer: <Badge variant="outline">Option {question.correct_option}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionManager;
