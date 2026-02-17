import React from 'react';
import '../styles/RideDetailsPanel.css';

const formatCAD = (value) => `$${parseFloat(value).toFixed(2)} CAD`;

const RideDetailsPanel = ({
  pickup,
  destination,
  distance,
  fare,
  pricingConfig,
  isLoggedIn,
  onModify,
  onConfirm
}) => {
  return (
    <div className="ride-details-card">
      <h3 className="ride-title">Ride Details</h3>

      <div className="ride-info">
        <p><strong>Pickup:</strong> {pickup.name}  </p>
        <p><strong>Destination:</strong> {destination.name}  </p>
        {distance && <p><strong>Total Distance:</strong> {distance} km</p>}
        {fare && <p><strong>Estimated Fare:</strong> {formatCAD(fare)}</p>}
      </div>

      {pricingConfig && (
        <div className="pricing-notes" style={{ background: '#f7f7f7', padding: '12px', borderRadius: '8px', marginTop: '1rem', fontSize: '0.9rem' }}>
           <ul style={{ paddingLeft: '20px', listStyle: 'disc' }}>
            <li>No cost for the first {pricingConfig.initial_wait_time} minutes of waiting.</li>
            <li>{formatCAD(pricingConfig.wait_time_cost)} per minute after that.</li>
            <li>Cancelation Fee: {formatCAD(pricingConfig.cancel_fees)}</li>
          </ul>
        </div>
      )}

      <div className="ride-buttons" style={{ marginTop: '1rem' }}>
        <button className="btn modify-btn" onClick={onModify}>Change</button>

        {isLoggedIn ? (
          <button className="btn confirm-btn" onClick={onConfirm} disabled={!fare}>
            {fare ? 'Continue' : 'Calculating...'}
          </button>
        ) : (
          <button className="btn confirm-btn" onClick={() => window.location.href = '/login'}>
            Login to Book
          </button>
        )}
      </div>
    </div>
  );
};

export default RideDetailsPanel;
