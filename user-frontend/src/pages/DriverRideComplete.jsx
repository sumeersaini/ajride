import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getRideFareBytMerchant } from "../api/driver";
import FullScreenLoader from "../components/FullScreenLoader";

import "../styles/DriverRideComplete.css";

const DriverRideComplete = () => {
  const { accessToken, user } = useAuth();
  const { rideId } = useParams();
  const [rideData, setRideData] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchRide() {
      try {
        const payload = { uuid: user?.id, rideId };
        const res = await getRideFareBytMerchant(payload, accessToken);
        const data = res.data.data;

        if (isMounted) {
          setRideData({
            fare: data.fare,
            distanceKm: data.distance_km,
            waitTime: data.wait_time,
            waitTimeCost: data.wait_time_cost,
          });
        }
      } catch (err) {
        console.error("Failed to fetch ride data:", err);
      }
    }

    if (rideId && user?.id) fetchRide();
    return () => { isMounted = false; };
  }, [rideId, accessToken, user?.id]);

  if (!rideData) return <FullScreenLoader />;

  return (
    <div className="ride-complete-page">
      <h2>Ride Completed</h2>
      <p><strong>Fare:</strong> ${rideData.fare.toFixed(2)}</p>
      <p><strong>Distance Travelled:</strong> {rideData.distanceKm} km</p>
      <p><strong>Wait Time:</strong> {rideData.waitTime}</p>
      <p><strong>Wait Time Cost:</strong> ${rideData.waitTimeCost.toFixed(2)}</p>
    </div>
  );
};

export default DriverRideComplete;
