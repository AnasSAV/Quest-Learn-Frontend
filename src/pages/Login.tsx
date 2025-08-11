import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';
import { authApi } from '@/services/auth.api';

const Login = () => {
  const [formData, setFormData] = useState({
    user_name: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Check if this is a demo login (when backend is not available)
      const isDemoLogin = formData.user_name.includes('demo');
      
      if (isDemoLogin) {
        // Demo login simulation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Validate demo credentials
        const validCredentials = 
          (formData.user_name === 'teacher_demo' && formData.password === 'password123') ||
          (formData.user_name === 'student_demo' && formData.password === 'password123');

        if (!validCredentials) {
          throw new Error('Invalid demo credentials');
        }

        // Mock demo data
        const role = formData.user_name === 'teacher_demo' ? 'TEACHER' : 'STUDENT';
        const userType = role === 'TEACHER' ? 'teacher' : 'student';
        
        localStorage.setItem('userId', 'demo-user-id');
        localStorage.setItem('userRole', role);
        localStorage.setItem('userType', userType);
        localStorage.setItem('userName', formData.user_name);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('token', 'demo-token');

        // Navigate to appropriate dashboard
        if (role === 'TEACHER') {
          navigate('/teacher-dashboard');
        } else {
          navigate('/student-dashboard');
        }
      } else {
        // Use actual API for authentication
        const response = await authApi.login({
          user_name: formData.user_name,
          password: formData.password
        });
        
        // Check if we received a valid token
        if (!response.access_token || typeof response.access_token !== 'string') {
          throw new Error('Invalid token received from server');
        }
        
        // Store the JWT token
        localStorage.setItem('token', response.access_token);
        
        // Decode the token to get user info
        const decodedToken = authApi.decodeToken(response.access_token);
        
        // Store user information
        localStorage.setItem('userId', decodedToken.sub);
        localStorage.setItem('userRole', decodedToken.role);
        localStorage.setItem('userName', formData.user_name);
        localStorage.setItem('isAuthenticated', 'true');
        
        // Map backend role to frontend userType for compatibility
        const userType = decodedToken.role === 'TEACHER' ? 'teacher' : 'student';
        localStorage.setItem('userType', userType);

        // Navigate to appropriate dashboard based on role
        if (decodedToken.role === 'TEACHER') {
          navigate('/teacher-dashboard');
        } else {
          navigate('/student-dashboard');
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Handle different types of errors
      let errorMessage = 'Login failed. Please check your credentials and try again.';
      
      if (err.response?.status === 401) {
        errorMessage = 'Invalid username or password.';
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (err.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Title */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <GraduationCap className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Welcome to QuestLearn</h1>
          <p className="text-muted-foreground mt-2">Sign in to your account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Input */}
              <div className="space-y-2">
                <Label htmlFor="user_name">Username</Label>
                <Input
                  id="user_name"
                  name="user_name"
                  type="text"
                  placeholder="Enter your username"
                  value={formData.user_name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Demo Information */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium text-foreground mb-2">Authentication Note:</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>The system will automatically detect if you're a teacher or student based on your account.</p>
                <p>Use your registered username and password to login.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
