import React from 'react';

// ✅ Helper function to format status string
const formatStatus = (status) => {
  if (!status) return "";
  return status
    .replace(/_/g, " ")           // Replace underscores with space
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
};

const DriverRideDetails = ({ rideData, eta, distance }) => {
  // Determine displayed destination
  const destination = rideData.status === 'in_progress' && rideData.finalDestination
    ? rideData.finalDestination
    : rideData.destination;

  return (
    <div className="ride-details">
      <h2>Ride Details</h2>
      <p><strong>Status:</strong> {formatStatus(rideData.status)}</p>
      <p><strong>Pickup:</strong> {rideData.pickup.name}</p>
      <p><strong>Destination:</strong> {destination.name}</p>
      <p><strong>Estimated Fare:</strong> ${rideData.estimatedFare}</p>
      <p><strong>Fare:</strong> {rideData.fare ? `$${rideData.fare}` : "Not completed"}</p>
      <p><strong>Requested At:</strong> {new Date(rideData.requestSentAt).toLocaleString()}</p>
      <p><strong>Accepted At:</strong> {rideData.acceptedAt ? new Date(rideData.acceptedAt).toLocaleString() : "Pending"}</p>
      <p><strong>Completed At:</strong> {rideData.completedAt ? new Date(rideData.completedAt).toLocaleString() : "Not completed"}</p>
      {eta && distance && (
        <p><strong>ETA:</strong> {eta} ({distance})</p>
      )}
    </div>
  );
};

export default DriverRideDetails;
