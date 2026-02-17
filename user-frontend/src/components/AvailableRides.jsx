import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { getNearbyDrivers, bookingRequestSend } from "../api/booking";
import { useNavigate } from "react-router-dom";
import { socket } from "../services/socket";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "16px",
      color: "#32325d",
      fontFamily: "'Inter', system-ui, sans-serif",
      "::placeholder": { color: "#a0aec0" },
      padding: "12px 14px",
    },
    invalid: { color: "#e53e3e", iconColor: "#e53e3e" },
  },
  hidePostalCode: true,
  disableLink: true,
};

const AvailableRidesInner = ({ pickup, destination, onBack, distance, setNearbyDrivers }) => {
  const { accessToken, user } = useAuth();
  const userEmail = user?.email;
  const userPhone = user?.phone;

  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRide, setSelectedRide] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [cardError, setCardError] = useState(null);
  const [cardComplete, setCardComplete] = useState(false);
  const currentRideIdRef = useRef(null);

  const stripe = useStripe();
  const elements = useElements();

  const fetchNearbyDrivers = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = { lat: pickup?.lat, lng: pickup?.lng, radius: 15, ride_distance: distance };
      const response = await getNearbyDrivers(payload, accessToken);
      const driverList = Array.isArray(response.data?.data) ? response.data.data : [];
      setRides(driverList);
      if (typeof setNearbyDrivers === "function") setNearbyDrivers(driverList);
    } catch (err) {
      console.error(err);
      setError("Error fetching rides");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pickup?.lat && pickup?.lng) fetchNearbyDrivers();
  }, [pickup]);

  const handleCardChange = (event) => {
    setCardError(event.error ? event.error.message : null);
    setCardComplete(event.complete);
  };

  const handleBookRide = async () => {
    if (!selectedRide || !stripe || !elements) return;
    if (!cardComplete) {
      setCardError("Please complete your card details");
      return;
    }

    setBookingLoading(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error("Card details not entered");

      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: { email: userEmail, phone: userPhone },
      });

      if (pmError) throw pmError;

      const bookRes = await bookingRequestSend(
        {
          driverId: selectedRide.uuid,
          pickup,
          destination,
          estimatedFare: selectedRide.fare,
          rideDistance: distance,
          paymentMethodId: paymentMethod.id,
        },
        accessToken
      );

      if (bookRes.data.success) {
        const { rideId } = bookRes.data.data;
        currentRideIdRef.current = String(rideId);
        socket.emit("join_ride", { rideId });
        // Keep bookingLoading true until WebSocket updates
      } else {
        setBookingLoading(false);
        setError(bookRes.data.message || "Failed to book ride");
      }
    } catch (err) {
      console.error(err);
      setBookingLoading(false);
      setError(err.message || "Error booking ride");
    }
  };

  useEffect(() => {
    socket.on("ride_update", ({ rideId, status }) => {
      if (String(rideId) === currentRideIdRef.current) {
        if (status === "no_driver_available") {
          setBookingLoading(false);
          setError("All drivers are busy");
          setSelectedRide(null);
          currentRideIdRef.current = null;
        }
      }
    });

    socket.on("ride_assigned", ({ rideId, driver, status }) => {
      if (String(rideId) === currentRideIdRef.current) {
        if (status === "accepted") {
          setBookingLoading(false);
          navigate(`/ride-tracking/${rideId}`, { state: { driver } });
        } else if (status === "rejected") {
          setBookingLoading(false);
          setError("Driver rejected your ride");
          setSelectedRide(null);
          currentRideIdRef.current = null;
        }
      }
    });

    return () => {
      socket.off("ride_update");
      socket.off("ride_assigned");
    };
  }, [navigate]);

  return (
    <div className="available-rides-container" style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      {onBack && <button onClick={onBack} style={{ marginBottom: "16px" }}>← Back</button>}
      <h2 style={{ marginBottom: "12px" }}>Choose a ride</h2>
      {loading && <p>Loading nearby rides...</p>}
      {error && <p className="error" style={{ color: "red" }}>{error}</p>}

      {/* Rides list */}
      {rides.map((ride) => (
        <div
          key={ride.uuid}
          onClick={() => { setSelectedRide(ride); setError(null); }}
          style={{
            border: selectedRide?.uuid === ride.uuid ? "2px solid #0070f3" : "1px solid #ccc",
            padding: "12px",
            marginBottom: "8px",
            borderRadius: "8px",
            cursor: "pointer",
            backgroundColor: selectedRide?.uuid === ride.uuid ? "#f0f8ff" : "#fff",
          }}
        >
          <h3>{ride.type}</h3>
          <p>Fare: {ride.fare.toFixed(2)} CAD</p>
        </div>
      ))}

      {/* Estimated fare summary */}
      {selectedRide && (
        <div className="fare-summary" style={{ marginTop: "12px", padding: "12px", backgroundColor: "#f8f8f8", borderRadius: "8px" }}>
          <p>Selected Ride Fare: <strong>{selectedRide.fare.toFixed(2)} CAD</strong></p>
        </div>
      )}

      {/* Stripe Card Element */}
      <div className="card-element-container" style={{ marginTop: "16px" }}>
        <label style={{ display: "block", marginBottom: "6px", fontWeight: "bold" }}>Card Details</label>
        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "12px",
            transition: "0.3s",
            boxShadow: cardError ? "0 0 0 2px #e53e3e" : "none",
          }}
        >
          <CardElement options={CARD_ELEMENT_OPTIONS} onChange={handleCardChange} />
        </div>
        {cardError && <p style={{ color: "#e53e3e", marginTop: "6px" }}>{cardError}</p>}
      </div>

      {/* Book Ride Button */}
      <button
        disabled={!selectedRide || bookingLoading || !cardComplete}
        onClick={handleBookRide}
        style={{
          padding: "10px 20px",
          marginTop: "16px",
          backgroundColor: !selectedRide || !cardComplete ? "#ccc" : "#0070f3",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: !selectedRide || !cardComplete ? "not-allowed" : "pointer",
          width: "100%",
        }}
      >
        {bookingLoading ? "Finding driver..." : "Book Now"}
      </button>
    </div>
  );
};

const AvailableRides = (props) => (
  <Elements stripe={stripePromise}>
    <AvailableRidesInner {...props} />
  </Elements>
);

export default AvailableRides;
