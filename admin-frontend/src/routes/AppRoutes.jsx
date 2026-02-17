import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import MainLayout from '../layouts/MainLayout';

// import Home from '../pages/Home';
// import About from '../pages/About';
// import Contact from '../pages/Contact';
import Login from '../pages/Login';
// import Hostlogin from '../pages/Hostlogin';
// import SignUp from '../pages/SignUp';
import NotFound from '../pages/NotFound';

// import Profile from '../pages/Profile'; // User dashboard
// import UserRoute from './UserRoute';
// import AuthRoute from './AuthRoute'; //  
import AdminRoute from './AdminRoute.jsx';       // admin for host-only pages
// import HostDashboard from '../pages/HostDashboard'; // Host dashboard page
// import AddCarPage from '../pages/AddCar'; //Your Add Car page
// import ViewCarPage from '../pages/ViewCars'; // Your Add Car page
// import CarDetailPage from '../pages/CarDetails';
// import EditCar from "../pages/EditCar";

// import CarBooking from '../pages/CarBooking';
// import Requesthost from '../pages/Requesthost';
import Dashboard from '../pages/Dashboard';
import UserDocuments from '../pages/UserDocuments';


// import Test from '../pages/test'
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Wrap all routes inside MainLayout, passing each page as children */}

        <Route path="/" element={<MainLayout><Login /></MainLayout>} />

        {/* admin dashboard */}
        <Route
          path="/dashboard"
          element={
            <MainLayout>
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            </MainLayout>
          }
        />

        <Route 
          path="/dashboard/:tab" 
          element={
          <MainLayout>
            <AdminRoute>
              <Dashboard />
            </AdminRoute>
          </MainLayout>} 
        />

        <Route path="/user-documents/:id" element={
          <MainLayout>
            <AdminRoute>
              <UserDocuments />
            </AdminRoute>
          </MainLayout>
        } />



        {/* Catch all - 404 */}
        <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
      </Routes>
    </BrowserRouter>
  );
}
