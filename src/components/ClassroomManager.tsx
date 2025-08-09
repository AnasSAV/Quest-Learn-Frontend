import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Users, Calendar, Trash2 } from 'lucide-react';
import { teacherApi, type Classroom } from '@/services/teacher.api';

interface ClassroomManagerProps {
  onClassroomSelect?: (classroomId: string | null) => void;
  selectedClassroomId?: string | null;
}

const ClassroomManager = ({ onClassroomSelect, selectedClassroomId }: ClassroomManagerProps) => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newClassroomName, setNewClassroomName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      setIsLoading(true);
      const classroomsData = await teacherApi.getAllClassrooms();
      
      // Ensure we have an array
      if (Array.isArray(classroomsData)) {
        setClassrooms(classroomsData);
        setError('');
      } else {
        console.error('Invalid classrooms data format:', classroomsData);
        setClassrooms([]);
        setError('Invalid data format received from server');
      }
    } catch (err) {
      console.error('Error fetching classrooms:', err);
      setError('Failed to load classrooms');
      setClassrooms([]); // Ensure classrooms is always an array
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassroomName.trim()) return;

    try {
      setIsCreating(true);
      const newClassroom = await teacherApi.createClassroom(newClassroomName.trim());
      
      // Ensure we have a valid classroom object
      if (newClassroom && typeof newClassroom === 'object') {
        setClassrooms(prev => Array.isArray(prev) ? [...prev, newClassroom] : [newClassroom]);
        setNewClassroomName('');
        setIsDialogOpen(false);
        setError('');
      } else {
        throw new Error('Invalid classroom data received');
      }
    } catch (err: any) {
      console.error('Error creating classroom:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create classroom');
    } finally {
      setIsCreating(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-muted-foreground">Loading classrooms...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Classrooms</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Classroom
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Classroom</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateClassroom} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="classroomName">Classroom Name</Label>
                  <Input
                    id="classroomName"
                    value={newClassroomName}
                    onChange={(e) => setNewClassroomName(e.target.value)}
                    placeholder="Enter classroom name"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? 'Creating...' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!Array.isArray(classrooms) || classrooms.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Classrooms Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first classroom to organize assignments.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* All Classrooms Option */}
            <div
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedClassroomId === null
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:bg-muted/50'
              }`}
              onClick={() => onClassroomSelect?.(null)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium">All Classrooms</h4>
                    <p className="text-sm text-muted-foreground">
                      View assignments from all classrooms
                    </p>
                  </div>
                </div>
                {selectedClassroomId === null && (
                  <Badge variant="default">Selected</Badge>
                )}
              </div>
            </div>

            {/* Individual Classrooms */}
            {Array.isArray(classrooms) && classrooms.map((classroom) => (
              <div
                key={classroom.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedClassroomId === classroom.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted/50'
                }`}
                onClick={() => onClassroomSelect?.(classroom.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">{classroom.name}</h4>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedClassroomId === classroom.id && (
                      <Badge variant="default">Selected</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ClassroomManager;
