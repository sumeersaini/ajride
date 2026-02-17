import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { GoogleMap, Marker, Polyline, useJsApiLoader } from "@react-google-maps/api";
import { useAuth } from "../context/AuthContext";
import { getRideDetailById } from "../api/booking";
import { socket } from "../services/socket";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const RideTracking = () => {
  const { rideId } = useParams();
  const { accessToken, user } = useAuth();

  const [ride, setRide] = useState(null);
  const [driverPos, setDriverPos] = useState(null);
  const [error, setError] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  // Fetch ride details
  useEffect(() => {
    const fetchRide = async () => {
      try {
        const payload = { uuid: user?.uuid, rideId };
        const res = await getRideDetailById(payload, accessToken);
        if (res.data.data.ride) {
          setRide(res.data.data.ride);
        } else {
          setError("Ride not found");
        }
      } catch (err) {
        setError("Error fetching ride");
      }
    };
    if (rideId && user) fetchRide();
  }, [rideId, user, accessToken]);

  // Listen for driver location updates
  useEffect(() => {
    if (!rideId) return;

    socket.emit("join_ride", { rideId });

    socket.on("driver_location", ({ lat, lng }) => {
      console.log("📍 Driver live update:", lat, lng);
      setDriverPos({ lat, lng });
    });

    return () => {
      socket.off("driver_location");
    };
  }, [rideId]);

  if (!isLoaded) return <p>Loading Google Maps...</p>;

  return (
    <div>
      <h2>Ride Tracking</h2>
      <p>Ride ID: {rideId}</p>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {ride && (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={driverPos || ride.pickup}
          zoom={14}
        >
          {/* Pickup marker */}
          <Marker position={ride.pickup} label="P" />

          {/* Destination marker */}
          <Marker position={ride.destination} label="D" />

          {/* Driver live marker */}
          {driverPos && (
            <Marker
              position={driverPos}
              icon={{
                url: "/images/car-icon.png", // 🚗 custom car icon
                scaledSize: new window.google.maps.Size(40, 40),
                anchor: new window.google.maps.Point(20, 20),
              }}
            />
          )}

          {/* Polyline between pickup & destination */}
          <Polyline
            path={[ride.pickup, ride.destination]}
            options={{
              strokeColor: "#1E90FF",
              strokeOpacity: 0.8,
              strokeWeight: 4,
            }}
          />
        </GoogleMap>
      )}
    </div>
  );
};

export default RideTracking;
