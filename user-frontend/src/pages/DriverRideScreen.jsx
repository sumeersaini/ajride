import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { socket } from "../services/socket";
import { useAuth } from "../context/AuthContext";
import { getRideDetailByIdMerchant } from "../api/driver";
import FullScreenLoader from "../components/FullScreenLoader";
import DriverRideMap from "../components/DriverMapComponents";
import DriverRideDetails from "../components/DriverRideDetails";
import DriverRideActions from "../components/DriverRideActions";
import "../styles/DriverRideScreen.css";

const DriverRideScreen = () => {
  const { accessToken, user } = useAuth();
  const { rideId } = useParams();

  const [driverPos, setDriverPos] = useState(null);
  const [geoError, setGeoError] = useState(null);
  const [rideData, setRideData] = useState(null);
  const [rideStatus, setRideStatus] = useState(null);
  const [eta, setEta] = useState(null);
  const [distance, setDistance] = useState(null);

  const handleStatusChange = useCallback(
    (newStatus) => {
      setRideStatus(newStatus);
      socket.emit("update_ride_status", { rideId, status: newStatus });
    },
    [rideId]
  );

  // Fetch ride details
  useEffect(() => {
    let isMounted = true;
    async function fetchRide() {
      try {
        const payload = { uuid: user?.id, rideId };
        const res = await getRideDetailByIdMerchant(payload, accessToken);
        const data = res.data.data.ride;

        if (isMounted) {
          setRideData({
            pickup: { lat: data.pickup.lat, lng: data.pickup.lng, name: data.pickup.name },
            destination: { lat: data.destination.lat, lng: data.destination.lng, name: data.destination.name },
            status: data.status,
            estimatedFare: data.estimated_fare,
            fare: data.fare,
            requestSentAt: data.request_sent_at,
            acceptedAt: data.accepted_at,
            completedAt: data.completed_at,
          });
          setRideStatus(data.status);
        }
      } catch (err) {
        console.error("Failed to fetch ride data:", err);
      }
    }

    if (rideId && user?.id) fetchRide();
    return () => { isMounted = false; };
  }, [rideId, accessToken, user?.id]);

  // Track driver location via socket
  useEffect(() => {
    if (!rideId) return;
    socket.emit("join_ride", { rideId });

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setDriverPos(newPos);
        setGeoError(null);
        socket.emit("driver_location_update", { rideId, lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        console.error("Geo error:", err);
        setGeoError(err.message);
      },
      { enableHighAccuracy: true, timeout: 20000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      socket.emit("leave_ride", { rideId }); // Leave room when driver leaves page
    };
  }, [rideId]);

  if (!user || !rideData || !driverPos) return <FullScreenLoader />;

  return (
    <div className="ride-container driver-ride">
      <div className="left-panel">
        <DriverRideDetails rideData={rideData} eta={eta} distance={distance} />
        <DriverRideActions
          rideId={rideId}
          rideStatus={rideStatus}
          handleStatusChange={handleStatusChange}
        />
      </div>
      <DriverRideMap
        driverPos={driverPos}
        rideData={rideData}
        eta={eta}
        distance={distance}
        geoError={geoError}
        setEta={setEta}
        setDistance={setDistance}
        rideStatus={rideStatus}
      />
    </div>
  );
};

export default DriverRideScreen;
