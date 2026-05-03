import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/login" replace />; // Redirect if unauthorized

  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      <Route path="/admin/*" element={
        <ProtectedRoute allowedRoles={['ADMIN', 'LIBRARIAN']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/user/*" element={
        <ProtectedRoute allowedRoles={['USER']}>
          <UserDashboard />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;
