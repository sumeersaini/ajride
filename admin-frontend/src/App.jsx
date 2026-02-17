import React from 'react';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
// import { LoaderProvider } from './context/LoaderContext';


 
export default function App() {
  return (
      // <LoaderProvider>
      <>
          <Toaster position="top-right" reverseOrder={false} />
          <AuthProvider>
            <div className="min-h-screen bg-gray-100 text-gray-900">
            <AppRoutes />
          </div>
        </AuthProvider>
      </>
    
  );
}
