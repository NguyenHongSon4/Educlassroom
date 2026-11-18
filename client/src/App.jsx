import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import AssignmentDetail from './pages/AssignmentDetail';
import TeacherCourses from './pages/TeacherCourses';
import EnrolledCourses from './pages/EnrolledCourses';
import StudentGrades from './pages/StudentGrades';
import AdminUsers from './pages/AdminUsers';
import AdminCategories from './pages/AdminCategories';
import Profile from './pages/Profile';
import AdminEnrollments from './pages/AdminEnrollments';

// Home redirect based on login
const HomeRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : <Navigate to="/courses" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomeRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:id" element={<CourseDetail />} />

              {/* Protected Routes (All authenticated users) */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/assignments/:id" element={<AssignmentDetail />} />
                <Route path="/profile" element={<Profile />} />
              </Route>

              {/* Student only */}
              <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                <Route path="/my-enrolled" element={<EnrolledCourses />} />
                <Route path="/my-grades" element={<StudentGrades />} />
              </Route>

              {/* Teacher & Admin */}
              <Route element={<ProtectedRoute allowedRoles={['teacher', 'admin']} />}>
                <Route path="/teacher/courses" element={<TeacherCourses />} />
              </Route>

              {/* Admin only */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/categories" element={<AdminCategories />} />
                <Route path="/admin/enrollments" element={<AdminEnrollments />} />
              </Route>

              {/* 404 Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
