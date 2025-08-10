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
import { toast } from '@/components/ui/sonner';

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
  const [isDraggingOver, setIsDraggingOver] = useState(false);

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

  const handleDropImage = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    // Reuse the same validations as selection
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be less than 2MB');
      return;
    }
    if (!file.type.startsWith('image/png')) {
      setError('Only PNG images are allowed');
      return;
    }
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setError('');
    setIsDraggingOver(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
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

  const setCorrectOption = (opt: 'A' | 'B' | 'C' | 'D') => {
    setFormData(prev => ({ ...prev, correct_option: opt }));
  };

  const increment = (field: 'per_question_seconds' | 'points', step: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: Math.max(1, (prev as any)[field] + step),
    }));
  };

  const isFormValid = () => {
    return (
      formData.prompt_text.trim() &&
      formData.option_a.trim() &&
      formData.option_b.trim() &&
      formData.option_c.trim() &&
      formData.option_d.trim() &&
      formData.per_question_seconds > 0 &&
      formData.points > 0
    );
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
      toast.success('Question created', { description: 'Your question was added to the assignment.' });
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
              <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg">Create New Question</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateQuestion} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {/* Left: Form */}
                  <div className="md:col-span-3 space-y-4">
                    {/* Question Prompt */}
                    <div className="space-y-1.5">
                      <Label htmlFor="prompt">Question Prompt *</Label>
                      <Textarea
                        id="prompt"
                        value={formData.prompt_text}
                        onChange={(e) => handleInputChange('prompt_text', e.target.value)}
                        placeholder="Enter the question text..."
                        className="bg-white border-gray-200 rounded-md"
                        rows={3}
                        maxLength={400}
                        required
                      />
                      <div className="text-xs text-muted-foreground text-right ">{formData.prompt_text.length}/400</div>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2">
                      <Label>Question Image (Optional)</Label>
                      <div
                        className={`border-2 border-dashed rounded-lg bg-white p-4 text-center transition-colors ${
                          imagePreview ? 'border-gray-300' : isDraggingOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDropImage}
                      >
                        {imagePreview ? (
                          <div className="space-y-2">
                            <img 
                              src={imagePreview} 
                              alt="Preview" 
                              className="max-w-full h-40 object-contain mx-auto"
                            />
                            <div className="flex justify-center gap-2">
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
                              <p className="text-xs text-green-600 text-center">✓ Image uploaded successfully</p>
                            )}
                          </div>
                        ) : (
                          <div>
                            <ImageIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                            <p className="text-xs text-gray-500 mb-2">Drag & drop a PNG (max 2MB) or select a file</p>
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
                    <div className="grid grid-cols-2 gap-3">
                      {(['A','B','C','D'] as const).map((opt) => (
                        <div key={opt} className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <Label htmlFor={`option_${opt.toLowerCase()}`}>Option {opt} *</Label>

                          </div>
                          <Input
                            id={`option_${opt.toLowerCase()}`}
                            value={(formData as any)[`option_${opt.toLowerCase()}`]}
                            onChange={(e) => handleInputChange(`option_${opt.toLowerCase()}` as any, e.target.value)}
                            placeholder={`Enter option ${opt}`}
                            maxLength={120}
                            className="border rounded-md bg-white border-gray-200"
                            required
                          />
                        </div>
                      ))}
                    </div>

                    {/* Correct Option */}
                    <div className="space-y-2">
                      <Label>Correct Answer *</Label>
                      <div className="flex gap-2">
                        {(['A','B','C','D'] as const).map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setCorrectOption(opt)}
                            className={`px-3 py-1.5 rounded-md border text-sm transition-colors ${
                              formData.correct_option === opt
                                ? 'border-green-500 bg-green-50 text-green-700'
                                : 'border-gray-200 bg-white hover:border-blue-300'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Time and Points */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="time">Time Limit (seconds)</Label>
                        <div className="flex items-center gap-2 border rounded-md">
                          <Input
                            id="time"
                            type="number"
                            min="1"
                            max="300"
                            value={formData.per_question_seconds}
                            onChange={(e) => handleInputChange('per_question_seconds', parseInt(e.target.value))}
                            className="text-center rounded-md bg-white border-gray-200"
                          />

                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="points">Points</Label>
                        <div className="flex items-center gap-2 border rounded-md">
                          <Input
                            id="points"
                            type="number"
                            min="1"
                            max="10"
                            value={formData.points}
                            onChange={(e) => handleInputChange('points', parseInt(e.target.value))}
                            className="text-center rounded-md bg-white border-gray-200"
                          />

                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Live Preview */}
                  <div className="md:col-span-2">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Live Preview</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">1</div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{formData.prompt_text || 'Your question text appears here'}</p>
                          </div>
                        </div>
                        {imagePreview && (
                          <div className="bg-gray-50 border rounded p-2">
                            <img src={imagePreview} alt="Preview" className="w-full h-auto rounded" />
                          </div>
                        )}
                        <div className="space-y-1.5">
                          {(['A','B','C','D'] as const).map((opt) => (
                            <div key={opt} className={`p-2 rounded border text-sm ${formData.correct_option === opt ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white'}`}>
                              <span className="font-semibold mr-1">{opt}.</span>
                              {(formData as any)[`option_${opt.toLowerCase()}`] || `Option ${opt}`}
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {formData.per_question_seconds}s</div>
                          <div className="flex items-center gap-1"><Star className="h-3.5 w-3.5" /> {formData.points} pts</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isCreating || (selectedImage && !uploadedImageKey) || !isFormValid()}
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
            <Card key={question.id} className="border-l-4 border-blue-500">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">Question {index + 1}</Badge>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{question.per_question_seconds}s</span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
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
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium mb-2 text-sm">{question.prompt_text}</h4>
                  {question.image_key && (
                    <div className="mb-3">
                      <img 
                        src={getQuestionImageUrl(question.image_key)} 
                        alt="Question" 
                        className="max-w-full h-40 object-contain border rounded"
                      />
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className={`p-2 rounded border text-sm ${getOptionStyle('A', question.correct_option)}`}>
                    <span className="font-semibold">A.</span> {question.option_a}
                  </div>
                  <div className={`p-2 rounded border text-sm ${getOptionStyle('B', question.correct_option)}`}>
                    <span className="font-semibold">B.</span> {question.option_b}
                  </div>
                  <div className={`p-2 rounded border text-sm ${getOptionStyle('C', question.correct_option)}`}>
                    <span className="font-semibold">C.</span> {question.option_c}
                  </div>
                  <div className={`p-2 rounded border text-sm ${getOptionStyle('D', question.correct_option)}`}>
                    <span className="font-semibold">D.</span> {question.option_d}
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  Correct Answer: <Badge variant="outline" className="text-xs">Option {question.correct_option}</Badge>
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
