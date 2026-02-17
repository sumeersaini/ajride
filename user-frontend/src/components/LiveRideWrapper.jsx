import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getActiveRide } from "../api/driver";
import { useAuth } from "../context/AuthContext";

import '../styles/NoRide.css';
const LiveRideWrapper = () => {
  const { accessToken, user } = useAuth();

  const [loading, setLoading] = useState(true);
  const activeRideIdLocal = localStorage.getItem("activeRideId");

  const [activeRideId, setActiveRideId] = useState(null);

  useEffect(() => {
    const fetchActiveRide = async () => {
      try {
        // if (!activeRideIdLocal){
        const response = await getActiveRide({}, accessToken);

        const rideData = response?.data?.data;

        console.log("rideData.status", rideData.status)
        if (rideData && rideData.status !== "completed" && rideData.status !== "cancelled") {
          const rideId = rideData.id;
          setActiveRideId(rideId);
          localStorage.setItem("activeRideId", rideId);
        } else {
          // Ride is completed or cancelled, treat as inactive
          localStorage.removeItem("activeRideId");
          setActiveRideId(null);
        }
        // } else {
        //   setActiveRideId(activeRideIdLocal);
        // }

      } catch (error) {
        console.error("Error fetching active ride:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveRide();
  }, [accessToken, activeRideIdLocal]);

  if (loading) {
    return (
      <div className="host-dashboard-content">
        <div className="loading">Checking for active ride...</div>
      </div>
    );
  }

  if (!activeRideId) {
    return (
      <div className="no-host-dashboard-content">
        <div className="no-ride-content">
          <div className="no-ride-icon"></div>
          <h2>No Active Ride</h2>
          <p>It looks like you don’t have any rides at the moment.</p>
        </div>
      </div>

    );
  }

  return <Navigate to={`/host/ride/${activeRideId}`} replace />;
};

export default LiveRideWrapper;
