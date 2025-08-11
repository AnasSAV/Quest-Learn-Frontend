import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GraduationCap, User } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <GraduationCap className="h-8 w-8 text-primary mr-2" />
            <h1 className="text-xl font-bold text-foreground">QuestLearn</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/teacher">
              <Button 
                variant={location.pathname.startsWith('/teacher') ? 'default' : 'outline'}
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Teacher
              </Button>
            </Link>
            <Link to="/student">
              <Button 
                variant={location.pathname.startsWith('/student') ? 'default' : 'outline'}
                className="flex items-center gap-2"
              >
                <GraduationCap className="h-4 w-4" />
                Student
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;