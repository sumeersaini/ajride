import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const { client, loading } = useAuth();

  if (loading) {
    // You can return a spinner or null while loading
    return  <div className="loading-host">
                <img  src="loading.svg" className="loading-cls-host"/>
            </div>;
  }

  if (!client) {
    return <Navigate to="/login" replace />;
  }

  // Check user metadata for client role
  console.log('admin route', client)
  if (client !== 'admin') {
    return <Navigate to="/" replace />; // redirect non-host to home
  }

  return children;
};

export default AdminRoute;
