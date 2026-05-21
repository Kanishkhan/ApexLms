import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from './store';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Guard
import ProtectedRoute from './routes/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import CoursePlayer from './pages/CoursePlayer';
import QuizPlayer from './pages/QuizPlayer';
import StudentDashboard from './pages/StudentDashboard';
import InstructorDashboard from './pages/InstructorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';

export default function App() {
  const { darkMode } = useSelector((state: RootState) => state.ui);

  // Sync dark mode class with documentElement on load and state change
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <Routes>
      {/* Public Pages wrapped in MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
      </Route>

      {/* Auth Pages without general layout */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      {/* Student dashboard paths */}
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/dashboard/enrolled" element={<StudentDashboard />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        
        {/* Fullscreen player experiences */}
        <Route path="/courses/:id/play" element={<CoursePlayer />} />
        <Route path="/quizzes/:id/play" element={<QuizPlayer />} />
      </Route>

      {/* Instructor studio paths */}
      <Route element={<ProtectedRoute allowedRoles={['instructor']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/instructor" element={<InstructorDashboard />} />
          <Route path="/instructor/courses" element={<InstructorDashboard />} />
          <Route path="/instructor/courses/new" element={<InstructorDashboard />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Admin control panel paths */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminDashboard />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Fallback to Home page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
