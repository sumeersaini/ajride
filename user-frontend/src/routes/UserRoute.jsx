import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UserRoute = ({ children }) => {
  const { user } = useAuth();
  const client = user?.user_metadata?.client;

  if (!user) return <Navigate to="/login" replace />;
  if (client !== 'user') return <Navigate to="/" replace />;

  return children;
};

export default UserRoute;