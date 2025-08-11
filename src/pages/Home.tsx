import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, User, BookOpen, BarChart3 } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <GraduationCap className="h-16 w-16 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Welcome to QuestLearn
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A comprehensive math homework assignment system designed for teachers and students
            to create, solve, and track mathematical problems with instant feedback.
          </p>
        </div>

        {/* Role Selection */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit mb-4">
                <User className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Teacher Panel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Upload math question images
                </li>
                <li className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Track student performance
                </li>
                <li className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  View detailed analytics
                </li>
              </ul>
              <Link to="/teacher" className="block">
                <Button className="w-full" size="lg">
                  Enter as Teacher
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit mb-4">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Student Panel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  View assigned problems
                </li>
                <li className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Submit answers instantly
                </li>
                <li className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Get immediate feedback
                </li>
              </ul>
              <Link to="/student" className="block">
                <Button className="w-full" size="lg" variant="outline">
                  Enter as Student
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="bg-muted/50 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-center text-foreground mb-8">
            Key Features
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Easy Upload</h3>
              <p className="text-sm text-muted-foreground">
                Teachers can quickly upload PNG images of math problems with correct answers.
              </p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Instant Feedback</h3>
              <p className="text-sm text-muted-foreground">
                Students receive immediate feedback on their answers with explanations.
              </p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Performance Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Comprehensive analytics help teachers monitor student progress.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;