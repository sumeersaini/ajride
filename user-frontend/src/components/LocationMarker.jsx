import React from 'react';
import { Marker, InfoWindow } from '@vis.gl/react-google-maps';
import '../styles/MarkerStyles.css';

const LocationMarker = ({ lat, lng, label, type, time, icon }) => {
  const isPickupOrDropoff = type === 'pickup' || type === 'dropoff';

  // Use default icons for pickup/dropoff unless a custom icon is provided
  const defaultIconUrl = type === 'pickup'
    ? 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
    : type === 'dropoff'
    ? 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
    : 'https://tychnbchdeltmyiwzpur.supabase.co/storage/v1/object/public/ajride/website/map-car64.png';

  const iconUrl = icon || defaultIconUrl;

  return (
    <>
      <Marker position={{ lat, lng }} icon={iconUrl} />

      {/* Only show popup for pickup/dropoff, not drivers */}
      {isPickupOrDropoff && (
        <InfoWindow
          position={{ lat, lng }}
          options={{ pixelOffset: new window.google.maps.Size(0, -30) }}
        >
          <div className="marker-popup-container">
            <div className="marker-time-box">
              {type === 'pickup' ? (
                <>ETA:<br /><strong>{time}</strong></>
              ) : (
                <>Trip:<br /><strong>{time}</strong></>
              )}
            </div>
            <div className="marker-label-box">
              <strong>{label}</strong>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

export default LocationMarker;
