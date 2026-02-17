import React, { useEffect, useState } from "react";
import "../styles/RideRequestPopup.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapMarkerAlt, faLocationArrow, faDollarSign, faCarSide } from "@fortawesome/free-solid-svg-icons";

export default function RideRequestPopup({ ride, onAccept, onReject }) {
  const [timeLeft, setTimeLeft] = useState(20);

  console.log("ride",ride)
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    const timeout = setTimeout(() => {
      onReject();
    }, 20000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [onReject]);

  return (
    <div className="ride-request-overlay">
      <div className="ride-request-box">
        <h2 className="ride-title">
          <FontAwesomeIcon icon={faCarSide} /> New Ride Request
        </h2>

        {/* Pickup & Destination */}
        <div className="ride-info">
          <p>
            <FontAwesomeIcon className="icon" icon={faMapMarkerAlt} />
            <strong>From:</strong> {ride.pickupName}
          </p>
          <p>
            <FontAwesomeIcon className="icon" icon={faLocationArrow} />
            <strong>To:</strong> {ride.destinationName}
          </p>
          <p className="fare">
            <FontAwesomeIcon className="icon" icon={faDollarSign} />
            <strong>Fare:</strong> ${parseFloat(ride.fare).toFixed(2)}
          </p>
        </div>

        {/* Timer Bar */}
        <div
          className="ride-request-timer"
          style={{ width: `${(timeLeft / 20) * 100}%` }}
        />

        {/* Actions */}
        <div className="ride-actions">
          <button className="btn accept" onClick={onAccept}>
            Accept
          </button>
          <button className="btn reject" onClick={onReject}>
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
