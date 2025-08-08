# API Services Structure

This directory contains the API services organized by functionality:

## Files Overview

### `auth.api.ts`
Handles all authentication-related API calls:
- `login(credentials)` - User login
- `logout()` - User logout  
- `decodeToken(token)` - JWT token decoding
- `isTokenValid(token)` - Token validation
- `getCurrentUser()` - Get current user info

### `teacher.api.ts`
Handles teacher-specific API calls:
- `uploadAssignment()` - Upload new assignments
- `getAssignments()` - Get all assignments
- `getStudentPerformance()` - Get student performance data
- `getDashboardStats()` - Get teacher dashboard statistics
- `getRecentAssignments()` - Get recent assignments

### `student.api.ts`
Handles student-specific API calls:
- `submitAnswer()` - Submit assignment answers
- `getMyAssignments()` - Get student's assignments
- `getDashboardStats()` - Get student dashboard statistics
- `getProgress()` - Get student progress data

### `api.client.ts`
Configures the Axios client with:
- Base URL configuration
- Request interceptors (for auth tokens)
- Response interceptors (for error handling)

### `index.ts`
Central export point that:
- Exports all API services
- Provides backward compatibility with legacy `api` object

## Usage Examples

```typescript
// Authentication
import { authApi } from '@/services/auth.api';
const response = await authApi.login({ email, password });

// Teacher operations
import { teacherApi } from '@/services/teacher.api';
const assignments = await teacherApi.getAssignments();

// Student operations
import { studentApi } from '@/services/student.api';
const result = await studentApi.submitAnswer(assignmentId, answer);

// Legacy compatibility (still works)
import { api } from '@/services';
const user = api.getCurrentUser();
```

## Environment Variables

Make sure to set the following in your `.env` file:
```
VITE_API_URL=https://overflowing-nature-production.up.railway.app
```
