// src/pages/PassengerRideScreen.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "../services/socket";
import { useAuth } from "../context/AuthContext";
import { getRideDetailById } from "../api/booking";
import FullScreenLoader from "../components/FullScreenLoader";
import PassengerRideMap from "../components/PassengerRideMap";
import "../styles/PassengerRideScreen.css";

const PassengerRideScreen = () => {
  const { accessToken, user } = useAuth();
  const { rideId } = useParams();
  const navigate = useNavigate();

  const [driverPos, setDriverPos] = useState(null);
  const [driverLocationReceived, setDriverLocationReceived] = useState(false);
  const [rideData, setRideData] = useState(null);
  const [eta, setEta] = useState(null);
  const [distance, setDistance] = useState(null);
  const [rideStatus, setRideStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Socket: Manage driver location and ride status updates
  useEffect(() => {
    if (!rideId) return;

    const logAll = (event, ...args) => {
      console.log("📥 [SOCKET EVENT] ", event, args);
    };
    socket.onAny(logAll);

    const handleDriverLocation = (data) => {
      if (data && typeof data.lat === "number" && typeof data.lng === "number") {
        setDriverPos({ lat: data.lat, lng: data.lng });
        setDriverLocationReceived(true);
      }
    };
    socket.on("driver_location", handleDriverLocation);

    // Listen for ride status updates to redirect when completed
    const handleRideStatusUpdate = (data) => {
      if (data.rideId === rideId) {
        setRideStatus(data.status);
        if (data.status === "completed") {
          navigate(`/ride/complete/${rideId}`);
        }
      }
    };
    socket.on("ride_status_update", handleRideStatusUpdate);

    const joinRoom = () => {
      socket.emit("join_ride", { rideId });
    };

    if (socket.connected) {
      joinRoom();
    } else {
      socket.once("connect", joinRoom);
    }

    return () => {
      socket.offAny(logAll);
      socket.off("driver_location", handleDriverLocation);
      socket.off("ride_status_update", handleRideStatusUpdate);
    };
  }, [rideId, navigate]);

  // ✅ Fetch ride details
  useEffect(() => {
    let isMounted = true;
    async function fetchRide() {
      try {
        setLoading(true);
        const payload = { uuid: user?.id, rideId };
        const res = await getRideDetailById(payload, accessToken);
        const data = res.data.data.ride;

        if (isMounted && data) {
          setRideData({
            pickup: { lat: data.pickup.lat, lng: data.pickup.lng, name: data.pickup.name },
            destination: { lat: data.destination.lat, lng: data.destination.lng, name: data.destination.name },
            status: data.status,
            estimatedFare: data.estimated_fare,
            fare: data.fare,
            requestSentAt: data.request_sent_at,
            acceptedAt: data.accepted_at,
            completedAt: data.completed_at,
            driver: data.driver || null,
            otp: data.otp || null,
          });
          setRideStatus(data.status);

          // Redirect immediately if ride already completed
          if (data.status === "completed") {
            navigate(`/ride/complete/${rideId}`);
          }

          if (data.driver?.last_location?.lat && data.driver?.last_location?.lng) {
            setDriverPos({
              lat: data.driver.last_location.lat,
              lng: data.driver.last_location.lng,
            });
            setDriverLocationReceived(true);
          }
        }
      } catch (err) {
        console.error("❌ Failed to fetch ride data:", err);
      } finally {
        setLoading(false);
      }
    }

    if (rideId && user?.id) fetchRide();
    return () => { isMounted = false; };
  }, [rideId, accessToken, user?.id, navigate]);

  if (loading || !rideData) return <FullScreenLoader />;

  return (
    <div className="ride-container passenger-ride">
      <div className="left-panel">
        <div className="ride-details">
          <h2>Your Ride</h2>
          {!driverLocationReceived && (
            <p style={{ color: "orange", fontWeight: "bold" }}>
              Waiting for driver location updates...
            </p>
          )}
          {eta && <p><strong>ETA:</strong> {eta}</p>}
          {distance && <p><strong>Distance:</strong> {distance}</p>}
          <p><strong>Status:</strong> {rideStatus.replace(/_/g, ' ').replace(/^./, str => str.toUpperCase())}</p>
          <p><strong>Pickup:</strong> {rideData.pickup.name}</p>
          <p><strong>Destination:</strong> {rideData.destination.name}</p>
          <p><strong>Estimated Fare:</strong> ${rideData.estimatedFare}</p>
          <p><strong>Fare:</strong> {rideData.fare ? `$${rideData.fare}` : "Not completed"}</p>
          <p><strong>Requested At:</strong> {new Date(rideData.requestSentAt).toLocaleString()}</p>
          <p><strong>Accepted At:</strong> {rideData.acceptedAt ? new Date(rideData.acceptedAt).toLocaleString() : "Pending"}</p>
          <p><strong>Completed At:</strong> {rideData.completedAt ? new Date(rideData.completedAt).toLocaleString() : "Not completed"}</p>
          <br />
          <p><strong>PIN:</strong> {rideData.otp || ""}</p>

          {rideData.driver && (
            <>
              <hr />
              <p><strong>Driver:</strong> {rideData.driver.name}</p>
              <p><strong>Vehicle:</strong> {rideData.driver.vehicle}</p>
              <p><strong>Phone:</strong> {rideData.driver.phone}</p>
            </>
          )}
        </div>
      </div>

      <div className="ride-map">
        <PassengerRideMap
          driverPos={driverPos}
          rideData={rideData}
          eta={eta}
          distance={distance}
          setEta={setEta}
          setDistance={setDistance}
          rideStatus={rideStatus}
        />
      </div>
    </div>
  );
};

export default PassengerRideScreen;
