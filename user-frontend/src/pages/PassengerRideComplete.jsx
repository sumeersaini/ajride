import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getRideFareByPassenger } from "../api/booking";
import FullScreenLoader from "../components/FullScreenLoader";
import "../styles/PassengerRideComplete.css";

const PassengerRideComplete = () => {
  const { accessToken, user } = useAuth();
  const { rideId } = useParams();
  const [rideData, setRideData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchRide = async () => {
      try {
        setLoading(true);
        const payload = { uuid: user?.id, rideId: Number(rideId) };
        const res = await getRideFareByPassenger(payload, accessToken);
        const data = res.data.data;

        if (isMounted && data) {
          setRideData({
            rideId: data.rideId,
            fare: data.fare,
            distance: data.distance_km,
            waitTime: data.wait_time,
            waitTimeCost: data.wait_time_cost,
          });
        }
      } catch (err) {
        console.error("Failed to fetch ride data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (rideId && user?.id) fetchRide();
    return () => { isMounted = false; };
  }, [rideId, accessToken, user?.id]);

  if (loading || !rideData) return <FullScreenLoader />;

  return (
    <div className="passenger-ride-complete">
      <h2>Ride Completed</h2>
      <div className="ride-card">
        <div className="ride-row">
          <span className="ride-label">Ride ID</span>
          <span className="ride-value">{rideData.rideId}</span>
        </div>
        <div className="ride-row">
          <span className="ride-label">Distance</span>
          <span className="ride-value">{rideData.distance} km</span>
        </div>
        <div className="ride-row">
          <span className="ride-label">Wait Time</span>
          <span className="ride-value">{rideData.waitTime}</span>
        </div>
        <div className="ride-row">
          <span className="ride-label">Wait Time Cost</span>
          <span className="ride-value">${rideData.waitTimeCost.toFixed(2)}</span>
        </div>
        <div className="ride-row total-fare-row">
          <span className="ride-label">Total Fare</span>
          <span className="ride-value">${rideData.fare.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default PassengerRideComplete;
