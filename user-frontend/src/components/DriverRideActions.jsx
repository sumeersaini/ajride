// src/components/DriverRideActions.jsx
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { startRide, reachDriver, cancelRide, endRide } from "../api/driver";
import "../styles/DriverRideActions.css";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { socket } from "../services/socket";

const DriverRideActions = ({ rideStatus, handleStatusChange, rideId }) => {
  const { accessToken, user } = useAuth();
  const navigate = useNavigate();
  const [showPinInput, setShowPinInput] = useState(false);
  const [pin, setPin] = useState("");
  const [loadingAction, setLoadingAction] = useState(null);

  // Cancel Ride
  const handleCancelRide = async () => {
    if (!window.confirm("Are you sure you want to cancel this ride?")) return;

    try {
      setLoadingAction("cancel");
      const payload = {
        uuid: user?.id,
        rideId,
        cancelledVia: "driver",
        cancelReason: "Driver cancelled the ride",
      };
      const res = await cancelRide(payload, accessToken);
      if (res.data?.error) toast.error(res.data.error.message || "Failed to cancel ride");
      else if (res.data?.data) {
        toast.success("Ride cancelled successfully");
        handleStatusChange("cancelled");
        socket.emit("ride_status_update", { rideId, status: "cancelled" });
      }
    } catch (err) {
      console.error(err);
      toast.error("Error cancelling ride");
    } finally {
      setLoadingAction(null);
    }
  };

  // Reach Passenger
  const handleReachPassenger = async () => {
    setLoadingAction("reach");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const payload = {
          uuid: user?.id,
          rideId,
          reachedLocation: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          reachedTiming: new Date().toISOString(),
        };
        try {
          const res = await reachDriver(payload, accessToken);
          if (res.data?.data) {
            toast.success("You have reached the passenger");
            handleStatusChange("driver_reached");
            socket.emit("ride_status_update", { rideId, status: "driver_reached" });
          } else {
            toast.error("Failed to update status");
          }
        } catch (err) {
          console.error(err);
          toast.error("Error marking reached");
        } finally {
          setLoadingAction(null);
        }
      },
      (err) => {
        console.error(err);
        toast.error("Enable GPS to continue");
        setLoadingAction(null);
      },
      { enableHighAccuracy: true, timeout: 60000, maximumAge: 5000 }
    );
  };

  // Start Ride with OTP
  const handleStartRide = async () => {
    if (!pin) return toast.error("Please enter OTP/PIN");
    setLoadingAction("start");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const payload = {
          uuid: user?.id,
          rideId,
          otp: pin,
          deviceStartTime: new Date().toISOString(),
          startLocation: { lat: pos.coords.latitude, lng: pos.coords.longitude },
        };
        try {
          const res = await startRide(payload, accessToken);
          if (res.data?.data) {
            toast.success("Ride started successfully");
            handleStatusChange("in_progress");
            setShowPinInput(false);
            setPin("");
            socket.emit("ride_status_update", { rideId, status: "in_progress" });
          } else {
            toast.error("Failed to start ride");
          }
        } catch (err) {
          console.error(err);
          toast.error("Error starting ride");
        } finally {
          setLoadingAction(null);
        }
      },
      (err) => {
        console.error(err);
        toast.error("Enable GPS to continue");
        setLoadingAction(null);
      },
      { enableHighAccuracy: true, timeout: 60000, maximumAge: 5000 }
    );
  };

  // Complete Ride
  const handleCompleteRide = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }

    // Confirm before completing ride
    if (!window.confirm("Are you sure you want to complete this ride?")) return;

    setLoadingAction("complete");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const payload = {
          rideId,
          uuid: user?.id,
          reachedLocation: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          reachedTiming: new Date().toISOString(),
        };

        console.log("payload complete", payload, accessToken);

        try {
          const res = await endRide(payload, accessToken);
          if (res.data?.success || res.data?.data) {
            toast.success("Ride ended successfully");
            handleStatusChange("completed");
            socket.emit("ride_status_update", { rideId, status: "completed" });

            // Remove ride socket listeners after completion
            socket.emit("leave_ride", { rideId });

            // Navigate to driver ride complete page
            navigate(`/host/ride/complete/${rideId}`);
          } else {
            toast.error(res.data?.message || "Failed to complete ride");
          }
        } catch (err) {
          console.error(err);
          toast.error("Error ending ride");
        } finally {
          setLoadingAction(null);
        }
      },
      (err) => {
        console.error(err);
        toast.error("Enable GPS to continue");
        setLoadingAction(null);
      },
      { enableHighAccuracy: true, timeout: 60000, maximumAge: 5000 }
    );
  };

  return (
    <div className="ride-actions">
      {rideStatus === "accepted" && (
        <div className="action-group">
          <button onClick={handleCancelRide} disabled={loadingAction === "cancel"} className="btn btn-red">
            {loadingAction === "cancel" ? "Cancelling..." : "Cancel Ride"}
          </button>
          <button onClick={handleReachPassenger} disabled={loadingAction === "reach"} className="btn btn-green">
            {loadingAction === "reach" ? "Updating..." : "Reached Passenger"}
          </button>
        </div>
      )}

      {rideStatus === "driver_reached" && (
        <div className="pin-section">
          {!showPinInput ? (
            <div className="action-group">
              <button onClick={() => setShowPinInput(true)} className="btn btn-green">Start Ride</button>
              <button onClick={handleCancelRide} disabled={loadingAction === "cancel"} className="btn btn-red">
                {loadingAction === "cancel" ? "Cancelling..." : "Cancel Ride"}
              </button>
            </div>
          ) : (
            <>
              <input type="password" placeholder="Enter OTP" value={pin} onChange={(e) => setPin(e.target.value)} className="input"/>
              <div className="action-group">
                <button onClick={handleStartRide} disabled={loadingAction === "start"} className="btn btn-green">
                  {loadingAction === "start" ? "Verifying..." : "Verify & Start"}
                </button>
                <button onClick={() => setShowPinInput(false)} className="btn btn-gray">Cancel</button>
              </div>
            </>
          )}
        </div>
      )}

      {rideStatus === "in_progress" && (
        <button onClick={handleCompleteRide} disabled={loadingAction === "complete"} className="btn btn-green">
          {loadingAction === "complete" ? "Completing..." : "Complete Ride"}
        </button>
      )}
    </div>
  );
};

export default DriverRideActions;
