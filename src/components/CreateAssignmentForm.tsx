import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CalendarIcon, Plus } from 'lucide-react';
import { teacherApi, type Classroom, type CreateAssignmentRequest } from '@/services/teacher.api';

interface CreateAssignmentFormProps {
  onAssignmentCreated?: (assignment: any) => void;
  selectedClassroomId?: string | null;
}

const CreateAssignmentForm = ({ onAssignmentCreated, selectedClassroomId }: CreateAssignmentFormProps) => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingClassrooms, setIsLoadingClassrooms] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    classroom_id: selectedClassroomId || '',
    title: '',
    description: '',
    opens_at: '',
    due_at: '',
    shuffle_questions: false
  });

  useEffect(() => {
    fetchClassrooms();
  }, []);

  useEffect(() => {
    if (selectedClassroomId) {
      setFormData(prev => ({ ...prev, classroom_id: selectedClassroomId }));
    }
  }, [selectedClassroomId]);

  const fetchClassrooms = async () => {
    try {
      setIsLoadingClassrooms(true);
      const classroomsData = await teacherApi.getAllClassrooms();
      setClassrooms(classroomsData);
    } catch (err) {
      console.error('Error fetching classrooms:', err);
      setError('Failed to load classrooms');
    } finally {
      setIsLoadingClassrooms(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const validateForm = () => {
    if (!formData.classroom_id) return 'Please select a classroom';
    if (!formData.title.trim()) return 'Please enter a title';
    if (!formData.description.trim()) return 'Please enter a description';
    if (!formData.opens_at) return 'Please set an opening date and time';
    if (!formData.due_at) return 'Please set a due date and time';
    
    const opensAt = new Date(formData.opens_at);
    const dueAt = new Date(formData.due_at);
    
    if (dueAt <= opensAt) return 'Due date must be after opening date';
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      
      // Convert local datetime to ISO string
      const assignmentData: CreateAssignmentRequest = {
        ...formData,
        opens_at: new Date(formData.opens_at).toISOString(),
        due_at: new Date(formData.due_at).toISOString(),
      };

      const newAssignment = await teacherApi.createAssignment(assignmentData);
      
      // Reset form
      setFormData({
        classroom_id: selectedClassroomId || '',
        title: '',
        description: '',
        opens_at: '',
        due_at: '',
        shuffle_questions: false
      });

      // Notify parent component
      onAssignmentCreated?.(newAssignment);

    } catch (err: any) {
      console.error('Error creating assignment:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create assignment');
    } finally {
      setIsLoading(false);
    }
  };

  // Set default dates (opens now, due in 1 week)
  useEffect(() => {
    const now = new Date();
    const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    if (!formData.opens_at) {
      setFormData(prev => ({ ...prev, opens_at: formatDateTimeLocal(now) }));
    }
    if (!formData.due_at) {
      setFormData(prev => ({ ...prev, due_at: formatDateTimeLocal(oneWeekLater) }));
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create New Assignment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Classroom Selection */}
          <div className="space-y-2">
            <Label htmlFor="classroom">Classroom *</Label>
            {isLoadingClassrooms ? (
              <div className="text-sm text-muted-foreground">Loading classrooms...</div>
            ) : (
              <Select
                value={formData.classroom_id}
                onValueChange={(value) => handleInputChange('classroom_id', value)}
                disabled={!!selectedClassroomId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a classroom" />
                </SelectTrigger>
                <SelectContent>
                  {classrooms.map((classroom) => (
                    <SelectItem key={classroom.id} value={classroom.id}>
                      {classroom.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Assignment Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter assignment title"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter assignment description"
              rows={3}
              required
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="opens_at">Opens At *</Label>
              <Input
                id="opens_at"
                type="datetime-local"
                value={formData.opens_at}
                onChange={(e) => handleInputChange('opens_at', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due_at">Due At *</Label>
              <Input
                id="due_at"
                type="datetime-local"
                value={formData.due_at}
                onChange={(e) => handleInputChange('due_at', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Shuffle Questions */}
          <div className="flex items-center space-x-2">
            <Switch
              id="shuffle_questions"
              checked={formData.shuffle_questions}
              onCheckedChange={(checked) => handleInputChange('shuffle_questions', checked)}
            />
            <Label htmlFor="shuffle_questions" className="text-sm">
              Shuffle questions for each student
            </Label>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFormData({
                  classroom_id: selectedClassroomId || '',
                  title: '',
                  description: '',
                  opens_at: '',
                  due_at: '',
                  shuffle_questions: false
                });
                setError('');
              }}
            >
              Reset
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Assignment'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateAssignmentForm;
