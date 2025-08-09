import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Users, Calendar, Trash2, BookOpen, GraduationCap, CheckCircle } from 'lucide-react';
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
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-9 w-24" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-xl border bg-white/50">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/50 backdrop-blur-sm">
      <CardHeader className="pb-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div>
              <CardTitle className="text-xl font-semibold">My Classrooms</CardTitle>
              <p className="text-blue-100 text-sm mt-1">
                Manage and organize your teaching spaces
              </p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm transition-all duration-200 hover:scale-105"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Plus className="h-4 w-4 text-blue-600" />
                  </div>
                  <span>Create New Classroom</span>
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateClassroom} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="classroomName" className="text-sm font-medium">
                    Classroom Name
                  </Label>
                  <Input
                    id="classroomName"
                    value={newClassroomName}
                    onChange={(e) => setNewClassroomName(e.target.value)}
                    placeholder="e.g., Math 101 - Spring 2025"
                    className="h-11 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="transition-all duration-200"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isCreating}
                    className="bg-blue-600 hover:bg-blue-700 transition-all duration-200 min-w-[100px]"
                  >
                    {isCreating ? (
                      <div className="flex items-center space-x-2">
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Creating...</span>
                      </div>
                    ) : (
                      'Create'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {error && (
          <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50/50 backdrop-blur-sm">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {!Array.isArray(classrooms) || classrooms.length === 0 ? (
          <div className="text-center py-12">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur-2xl opacity-20 scale-150"></div>
              <div className="relative p-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full w-24 h-24 mx-auto flex items-center justify-center">
                <GraduationCap className="h-12 w-12 text-blue-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Ready to Start Teaching?
            </h3>
            <p className="text-gray-600 mb-6 max-w-sm mx-auto leading-relaxed">
              Create your first classroom to organize assignments and connect with your students.
            </p>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 hover:scale-105 shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Classroom
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* All Classrooms Option */}
            <div
              className={`group relative p-4 rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden ${
                selectedClassroomId === null
                  ? 'border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-blue-200 hover:shadow-lg hover:bg-blue-50/30'
              }`}
              onClick={() => onClassroomSelect?.(null)}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl transition-all duration-200 ${
                    selectedClassroomId === null 
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                  }`}>
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg">All Classrooms</h4>
                    <p className="text-gray-500 text-sm mt-1">
                      View and manage assignments from all your classrooms
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                </div>
              </div>
            </div>

            {/* Individual Classrooms */}
            {Array.isArray(classrooms) && classrooms.map((classroom, index) => (
              <div
                key={classroom.id}
                className={`group relative p-4 rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden ${
                  selectedClassroomId === classroom.id
                    ? 'border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-blue-200 hover:shadow-lg hover:bg-blue-50/30'
                }`}
                onClick={() => onClassroomSelect?.(classroom.id)}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl transition-all duration-200 ${
                      selectedClassroomId === classroom.id 
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'
                    }`}>
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">{classroom.name}</h4>
                      <div className="flex items-center space-x-4 mt-1">
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
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
