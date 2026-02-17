import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const HostRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    // You can return a spinner or null while loading
    return  <div className="loading-host">
                <img  src="loading.svg" className="loading-cls-host"/>
            </div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check user metadata for client role
  if (user?.user_metadata?.client !== 'host') {
    return <Navigate to="/" replace />; // redirect non-host to home
  }

  return children;
};

export default HostRoute;
