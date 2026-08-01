import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { Toaster } from 'react-hot-toast';

// Import Layouts
import DashboardLayout from './layouts/DashboardLayout.jsx';

// Import Router Guard
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Import Pages
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import ManageStudents from './pages/ManageStudents.jsx';
import UploadCertificate from './pages/UploadCertificate.jsx';
import CertificatesList from './pages/CertificatesList.jsx';
import CertificateDetails from './pages/CertificateDetails.jsx';
import VerificationPage from './pages/VerificationPage.jsx';
import Profile from './pages/Profile.jsx';
import AdminLogs from './pages/AdminLogs.jsx';
import NotFound from './pages/NotFound.jsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Global Toast Notifications config */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0f172a',
              color: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }
          }}
        />

        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Public Verification routes */}
          <Route path="/verify/:certificateId" element={<VerificationPage />} />
          <Route path="/verify/scan" element={<VerificationPage />} />

          {/* Protected Area Layout */}
          <Route 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Fallback to respective role dashboard */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Common protected routes */}
            <Route path="/profile" element={<Profile />} />

            {/* Admin only routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/students" 
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <ManageStudents />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/upload" 
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <UploadCertificate />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/certificates" 
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <CertificatesList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/certificates/:id" 
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <CertificateDetails />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/logs" 
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminLogs />
                </ProtectedRoute>
              } 
            />

            {/* Student only routes */}
            <Route 
              path="/student/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/certificates" 
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <CertificatesList />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/student/certificates/:id" 
              element={
                <ProtectedRoute allowedRoles={['Student']}>
                  <CertificateDetails />
                </ProtectedRoute>
              } 
            />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
