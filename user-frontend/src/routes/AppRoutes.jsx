import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from '../layouts/MainLayout';

import Home from '../pages/Home';
import About from '../pages/About';
import Contact from '../pages/Contact';
import Login from '../pages/Login';
import Hostlogin from '../pages/Hostlogin';
import SignUp from '../pages/SignUp';
import NotFound from '../pages/NotFound';

import Profile from '../pages/Profile'; // User dashboard
import UserRoute from './UserRoute';
import AuthRoute from './AuthRoute';
import HostRoute from './HostRoute.jsx'; // HostRoute for host-only pages
import HostDashboard from '../pages/HostDashboard'; // Host dashboard page
import AddCarPage from '../pages/AddCar';
import ViewCarPage from '../pages/ViewCars';
import CarDetailPage from '../pages/CarDetails';
import EditCar from "../pages/EditCar";

import CarBooking from '../pages/CarBooking';
import Requesthost from '../pages/Requesthost';
import HostOnboarding from '../pages/HostOnboarding';

import BookingStep1 from '../pages/BookingStep1.jsx';
import DriverStatus from "../pages/DriverStatus";
import DriverMessages from "../pages/DriverMessages";
import DriverReservations from "../pages/DriverReservations";
import DriverEarnings from "../pages/DriverEarnings";
import RideTracking from '../pages/PassengerRideScreen.jsx';
import DriverRideScreen from '../pages/DriverRideScreen.jsx';
import LiveRideWrapper from "../components/LiveRideWrapper";
import PassengerRideLive from '../components/PassengerRideLive.jsx';
import AuthCallback from "../pages/AuthCallback";

// Ride complete pages
import DriverRideComplete from "../pages/DriverRideComplete";
import PassengerRideComplete from "../pages/PassengerRideComplete";

import PassengerHistory from '../pages/PassengerHistory.jsx';

import Test from '../pages/test'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Public Pages */}
      <Route path="/" element={<MainLayout><Home /></MainLayout>} />
      <Route path="/about" element={<MainLayout><About /></MainLayout>} />
      <Route path="/contact" element={<MainLayout><Contact /></MainLayout>} />
      <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
      <Route path="/hostlogin" element={<MainLayout><Hostlogin /></MainLayout>} />
      <Route path="/signup" element={<MainLayout><SignUp /></MainLayout>} />

      {/* Host dashboard and nested routes */}
      <Route
        path="/host-dashboard"
        element={
          <MainLayout>
            <HostRoute>
              <HostDashboard />
            </HostRoute>
          </MainLayout>
        }
      />

      <Route path="/booking-step1" element={<MainLayout><BookingStep1 /></MainLayout>} />

      {/* Host pages */}
      <Route path="/host" element={<Navigate to="/host/status" replace />} />
      <Route
        path="/host"
        element={
          <MainLayout>
            <HostRoute>
              <HostDashboard />
            </HostRoute>
          </MainLayout>
        }
      >
        <Route path="status" element={<DriverStatus />} />
        <Route path="messages" element={<DriverMessages />} />
        <Route path="reservations" element={<DriverReservations />} />
        <Route path="earnings" element={<DriverEarnings />} />
        <Route path="ride/:rideId" element={<DriverRideScreen />} />
        <Route path="ride/current" element={<LiveRideWrapper />} />

        {/* ✅ Driver Ride Complete */}
        <Route path="ride/complete/:rideId" element={<DriverRideComplete />} />
      </Route>

      {/* Authenticated user pages */}
      <Route
        path="/profile"
        element={
          <MainLayout>
            <AuthRoute>
              <Profile />
            </AuthRoute>
          </MainLayout>
        }
      />

      <Route
        path="/ride-tracking/:rideId"
        element={
          <MainLayout>
            <AuthRoute>
              <RideTracking />
            </AuthRoute>
          </MainLayout>
        }
      />

      <Route
        path="/live-ride"
        element={
          <MainLayout>
            <AuthRoute>
              <PassengerRideLive />
            </AuthRoute>
          </MainLayout>
        }
      />

      <Route
        path="/ride/complete/:rideId"
        element={
          <MainLayout>
            <AuthRoute>
              <PassengerRideComplete />
            </AuthRoute>
          </MainLayout>
        }
      />

      <Route
        path="/ride/history"
        element={
          <MainLayout>
            <AuthRoute>
              <PassengerHistory />
            </AuthRoute>
          </MainLayout>
        }
      />

      <Route
        path="/car-booking/:id"
        element={
          <MainLayout>
            <AuthRoute>
              <CarBooking />
            </AuthRoute>
          </MainLayout>
        }
      />

      <Route path="/test" element={
        <MainLayout>
          <AuthRoute>
            <Test />
          </AuthRoute>
        </MainLayout>
      } />

      <Route
        path="/requesthost"
        element={
          <MainLayout>
            <AuthRoute>
              <Requesthost />
            </AuthRoute>
          </MainLayout>
        }
      />

      <Route
        path="/host-onboarding"
        element={
          <MainLayout>
            <AuthRoute>
              <HostOnboarding />
            </AuthRoute>
          </MainLayout>
        }
      />

      {/* Catch all - 404 */}
      <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
    </Routes>
  );
}
