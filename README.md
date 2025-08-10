# 🧮 Math Buddy Frontend

## Overview

Math Buddy is a comprehensive educational platform that connects teachers and students through interactive math assignments, real-time progress tracking, and detailed analytics. The platform features a modern, responsive design with role-based dashboards for both educators and learners.

## Features

### Teacher Features
- **Classroom Management**: Create and manage multiple classrooms
- **Assignment Creation**: Build custom math assignments with various question types
- **Question Bank Management**: Upload and organize questions with images
- **Student Analytics**: Comprehensive performance tracking and reporting
- **Real-time Monitoring**: Live assignment progress and submission tracking
- **Export Capabilities**: Generate detailed reports and analytics

### Student Features
- **Interactive Assignments**: Engage with math problems in a user-friendly interface
- **Progress Tracking**: Monitor personal performance and improvement
- **Multiple Classrooms**: Join and participate in multiple classroom environments
- **Submission History**: Review past assignments and results
- **Real-time Feedback**: Immediate scoring and performance insights

### Design & UX
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile
- **Dark/Light Theme**: Adaptive theming for user preference
- **Accessibility**: WCAG compliant with keyboard navigation support
- **Performance Optimized**: Fast loading with Vite build system

## Technology Stack

### Frontend Framework
- **React 18.3.1**: Modern React with hooks and functional components
- **TypeScript 5.5.3**: Type-safe development with enhanced IDE support
- **Vite 5.4.1**: Lightning-fast build tool and development server

### UI & Styling
- **Tailwind CSS 3.4.11**: Utility-first CSS framework
- **shadcn/ui**: High-quality React components built on Radix UI
- **Lucide React**: Beautiful, customizable icons
- **Radix UI**: Accessible, unstyled UI primitives

### State Management & Data Fetching
- **TanStack React Query 5.56.2**: Powerful data synchronization
- **React Hook Form 7.53.0**: Performant forms with easy validation
- **Axios 1.11.0**: Promise-based HTTP client

### Routing & Navigation
- **React Router DOM 6.26.2**: Declarative routing for React applications

### Development Tools
- **ESLint**: Code linting and formatting
- **TypeScript ESLint**: TypeScript-specific linting rules
- **Vite Plugins**: React SWC for fast refresh

## Installation

### Prerequisites
- **Node.js**: Version 18 or higher
- **npm**: Version 8 or higher
- **Git**: For version control

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/AnasSAV/Math-Buddy-Frontend.git
   cd Math-Buddy-Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   VITE_APP_NAME=Math Buddy
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── Dashboard.tsx   # Main dashboard component
│   ├── Navigation.tsx  # Navigation bar
│   └── ...             # Other components
├── pages/              # Route-level components
│   ├── Home.tsx        # Landing page
│   ├── Login.tsx       # Authentication
│   ├── TeacherDashboard.tsx
│   ├── StudentDashboard.tsx
│   └── ...
├── services/           # API service layer
│   ├── api.client.ts   # Axios configuration
│   ├── auth.api.ts     # Authentication APIs
│   ├── teacher.api.ts  # Teacher-specific APIs
│   └── student.api.ts  # Student-specific APIs
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── App.tsx             # Main app component
└── main.tsx           # Entry point
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run dev:host     # Start dev server with network access

# Building
npm run build        # Production build
npm run build:dev    # Development build
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # TypeScript type checking
```

## 🌐 API Integration

This frontend application connects to the Math Buddy backend API. Make sure to set up the backend repository:

**Backend Repository**: [Math-Buddy-Backend](https://github.com/AnasSAV/Math-Buddy-Backend)

### Environment Configuration

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000
VITE_API_TIMEOUT=10000

# Application Settings
VITE_APP_NAME=Math Buddy
VITE_APP_VERSION=1.0.0

# Development Settings
VITE_DEV_MODE=true
```

## 🎯 Key Components

### Authentication System
- JWT-based authentication with automatic token refresh
- Role-based access control (Teacher/Student)
- Protected routes with redirect functionality

### Teacher Dashboard
- **Classroom Management**: Create, view, and manage classrooms
- **Assignment Creation**: Build assignments with multiple question types
- **Student Analytics**: Comprehensive performance reports
- **Question Bank**: Upload and organize teaching materials

### Student Dashboard
- **Assignment Interface**: Interactive problem-solving environment
- **Progress Tracking**: Personal performance metrics
- **Submission History**: Review past work and improvements

### Responsive Design
- Mobile-first approach with progressive enhancement
- Adaptive layouts for different screen sizes
- Touch-friendly interactions for tablet users

## uthentication & Security

- **JWT Token Management**: Secure token storage and automatic refresh
- **Role-Based Access**: Separate interfaces for teachers and students
- **Protected Routes**: Authentication required for sensitive areas
- **Input Validation**: Client-side validation with server-side backup
- **HTTPS Ready**: Production-ready security configuration

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Browsers**: iOS Safari 14+, Android Chrome 90+
- **Progressive Enhancement**: Graceful degradation for older browsers

## Deployment

### Production Build
```bash
npm run build
```

### Environment-Specific Builds
```bash
npm run build:dev      # Development environment
npm run build:staging  # Staging environment
npm run build:prod     # Production environment
```

### Deployment Platforms
- **Vercel**: Zero-configuration deployment
- **Netlify**: Continuous deployment from Git
- **AWS S3 + CloudFront**: Scalable static hosting
- **Docker**: Containerized deployment

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email [anashussaindeen@gmail.com]

---

## 🔗 Related Repositories

- **Backend API**: [Math-Buddy-Backend](https://github.com/AnasSAV/Math-Buddy-Backend)
---

