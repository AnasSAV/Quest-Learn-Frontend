import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GraduationCap, Eye, EyeOff, User, Lock, ArrowRight } from 'lucide-react';
import { authApi } from '@/services/auth.api';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({ user_name: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
    setError('');
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const isDemo = formData.user_name.includes('demo');

      if (isDemo) {
        await new Promise(r => setTimeout(r, 700));
        const ok =
          (formData.user_name === 'teacher_demo' && formData.password === 'password123') ||
          (formData.user_name === 'student_demo' && formData.password === 'password123');
        if (!ok) throw new Error('Invalid demo credentials');

        const role = formData.user_name === 'teacher_demo' ? 'TEACHER' : 'STUDENT';
        const userType = role === 'TEACHER' ? 'teacher' : 'student';
        localStorage.setItem('userId', 'demo-user-id');
        localStorage.setItem('userRole', role);
        localStorage.setItem('userType', userType);
        localStorage.setItem('userName', formData.user_name);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('token', 'demo-token');
        navigate(role === 'TEACHER' ? '/teacher-dashboard' : '/student-dashboard');
      } else {
        const res = await authApi.login({
          user_name: formData.user_name,
          password: formData.password,
        });
        if (!res.access_token || typeof res.access_token !== 'string') {
          throw new Error('Invalid token received from server');
        }
        localStorage.setItem('token', res.access_token);
        const decoded = authApi.decodeToken(res.access_token);
        localStorage.setItem('userId', decoded.sub);
        localStorage.setItem('userRole', decoded.role);
        localStorage.setItem('userName', formData.user_name);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userType', decoded.role === 'TEACHER' ? 'teacher' : 'student');
        navigate(decoded.role === 'TEACHER' ? '/teacher-dashboard' : '/student-dashboard');
      }
    } catch (err: any) {
      let msg = 'Login failed. Please check your credentials and try again.';
      if (err.response?.status === 401) msg = 'Invalid username or password.';
      else if (err.response?.status === 500) msg = 'Server error. Please try again later.';
      else if (err.code === 'NETWORK_ERROR') msg = 'Network error. Please check your connection.';
      else if (err.message) msg = err.message;
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen max-w-500px overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      {/* background accents */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
      </div>

      {/* Center the whole auth card */}
      <div className="relative flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-4xl grid md:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl border border-slate-200/60 bg-background dark:border-slate-800/60">
          {/* Left welcome panel */}
          <div className="hidden md:flex flex-col bg-gradient-to-b from-blue-600 to-indigo-700 text-white">
            {/* Top section */}
            <div className="p-10">
              <p className="text-sm/6 opacity-90">Hello,</p>
              <h2 className="text-3xl font-semibold tracking-tight">welcome to!</h2>
            </div>
            {/* Center section */}
            <div className="flex flex-col items-center justify-center text-center flex-grow mb-20">
              <img
              src="/logo.png" 
              alt="QuestLearn Logo"
              className="h-24 w-24" 
              />
              <div className="text-2xl font-semibold">QuestLearn</div>
              <p className="mt-3 max-w-sm text-white/85 text-sm">
              Learn faster with assignments, auto-grading, and real-time insights for teachers and students.
              </p>
            </div>
          </div>

          {/* Right auth panel */}
          <div className="p-6 sm:p-8 md:p-10 md:pl-8 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
            {/* Mobile header */}
            <div className="md:hidden mb-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-b from-blue-600 to-indigo-700 text-white">
                <GraduationCap className="h-7 w-7" />
              </div>
              <h1 className="mt-4 text-2xl font-semibold text-foreground">Welcome to QuestLearn</h1>
              <p className="text-muted-foreground">Sign in to your account</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
              {/* Username - underline style (no white box) */}
              <div>
                <label htmlFor="user_name" className="block text-sm text-muted-foreground">
                  Username
                </label>
                <div className="relative mt-1">
                  <User className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="user_name"
                    name="user_name"
                    type="text"
                    placeholder="Enter your username"
                    value={formData.user_name}
                    onChange={onChange}
                    required
                    className="w-full bg-transparent pl-6 pr-2 text-foreground placeholder:text-muted-foreground/70
                               border-0 border-b border-slate-300/70 focus:border-blue-600 focus:outline-none focus:ring-0
                               dark:border-slate-600/70 dark:focus:border-blue-400 py-2"
                  />
                </div>
              </div>

              {/* Password - underline style (no white box) */}
              <div>
                <label htmlFor="password" className="block text-sm text-muted-foreground">
                  Password
                </label>
                <div className="relative mt-1">
                  <Lock className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={onChange}
                    required
                    className="w-full bg-transparent pl-6 pr-10 text-foreground placeholder:text-muted-foreground/70
                               border-0 border-b border-slate-300/70 focus:border-blue-600 focus:outline-none focus:ring-0
                               dark:border-slate-600/70 dark:focus:border-blue-400 py-2"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Actions */}
              <div className="space-y-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in…' : 'Sign In'}
                </Button>

                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => navigate('/forgot-password')}
                  >
                    Forgot password?
                  </button>
                </div>
              </div>
            </form>

            {/* Info strip */}
            <div className="mt-8 rounded-xl border bg-muted/40 p-4 dark:border-slate-800/60">
              <div className="mb-1 flex items-center gap-2 text-sm font-medium text-foreground">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse" />
                Authentication
              </div>
              <p className="text-xs text-muted-foreground">
                The system will automatically detect if you're a teacher or student based on your account.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Use your registered username and password to login.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
