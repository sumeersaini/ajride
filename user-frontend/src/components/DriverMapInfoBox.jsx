import React from 'react';

export const DriverMapInfoBox = ({ eta, distance }) => {
  if (!eta || !distance) {
    return null;
  }
  return (
    <div className="map-info-box">
      <div className="info-item">
        <strong>ETA:</strong> {eta}
      </div>
      <div className="info-item">
        <strong>Distance:</strong> {distance}
      </div>
    </div>
  );
};