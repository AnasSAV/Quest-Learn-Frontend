import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const TeacherUploadForm = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select a PNG or other image file.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!selectedFile || !correctAnswer.trim()) {
      toast({
        title: "Missing information",
        description: "Please select an image and enter the correct answer.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      await api.uploadAssignment(selectedFile, correctAnswer.trim());
      
      toast({
        title: "Assignment uploaded successfully!",
        description: "The assignment has been added to the system.",
      });
      
      // Reset form
      setSelectedFile(null);
      setCorrectAnswer('');
      setPreviewUrl(null);
      
      // Reset file input
      const fileInput = document.getElementById('question-image') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading the assignment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload New Assignment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="question-image">Question Image (PNG)</Label>
            <Input
              id="question-image"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="cursor-pointer"
            />
          </div>

          {previewUrl && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-4 bg-muted/50">
                <img
                  src={previewUrl}
                  alt="Question preview"
                  className="max-w-full h-auto rounded-lg shadow-sm"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="correct-answer">Correct Answer</Label>
            <Input
              id="correct-answer"
              type="text"
              placeholder="Enter the correct answer..."
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={isUploading || !selectedFile || !correctAnswer.trim()}
          >
            {isUploading ? (
              "Uploading..."
            ) : (
              <>
                <ImageIcon className="h-4 w-4 mr-2" />
                Upload Assignment
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TeacherUploadForm;