// src/components/PassengerRideMap.jsx
import React, { useEffect, memo, useRef } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";

// ✅ Marker component
const PassengerMarker = ({ lat, lng, iconUrl, altText }) => (
  <AdvancedMarker position={{ lat, lng }}>
    <img src={iconUrl} alt={altText} style={{ width: 32, height: 32 }} />
  </AdvancedMarker>
);

// ✅ InfoWindow for ETA
const PassengerInfoWindow = ({ lat, lng, label, time }) => (
  <>
    <AdvancedMarker position={{ lat, lng }} />
    <InfoWindow position={{ lat, lng }}>
      <div className="infowindow">
        <strong>{label}</strong>
        <div>ETA: {time || "Now"}</div>
      </div>
    </InfoWindow>
  </>
);

// ✅ Route renderer
const PassengerDirectionsRenderer = memo(
  ({ origin, destination, setEta, setDistance }) => {
    const map = useMap();
    const routesLibrary = useMapsLibrary("routes");
    const directionsServiceRef = useRef(null);
    const directionsRendererRef = useRef(null);

    useEffect(() => {
      if (!routesLibrary || !map) return;

      directionsServiceRef.current = new routesLibrary.DirectionsService();
      directionsRendererRef.current = new routesLibrary.DirectionsRenderer({
        map,
        suppressMarkers: true,
        preserveViewport: true,
      });

      return () => {
        if (directionsRendererRef.current) {
          directionsRendererRef.current.setMap(null);
        }
      };
    }, [routesLibrary, map]);

    useEffect(() => {
      if (
        !directionsServiceRef.current ||
        !directionsRendererRef.current ||
        !origin ||
        !destination
      ) {
        return;
      }

      console.log("🧭 Requesting directions:", { origin, destination });

      directionsServiceRef.current.route(
        {
          origin,
          destination,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === "OK") {
            directionsRendererRef.current.setDirections(result);
            const leg = result.routes?.[0]?.legs?.[0];
            if (leg) {
              setEta(leg.duration.text);
              setDistance(leg.distance.text);
            }
          } else {
            console.error("Directions request failed:", status);
          }
        }
      );
    }, [origin, destination, setEta, setDistance]);

    return null;
  }
);

// ✅ Live Traffic Layer component
const TrafficLayerComponent = () => {
  const map = useMap();
  const mapLibrary = useMapsLibrary("maps");

  useEffect(() => {
    if (!map || !mapLibrary) {
      return;
    }

    const trafficLayer = new mapLibrary.TrafficLayer();
    trafficLayer.setMap(map);

    return () => {
      trafficLayer.setMap(null); // Cleanup on unmount
    };
  }, [map, mapLibrary]);

  return null;
};

// ✅ Main Map Component
const PassengerRideMap = ({
  driverPos,
  rideData,
  rideStatus,
  setEta,
  setDistance,
  eta,
}) => {
  console.log("🔍 Rendering Map");
  console.log("Driver Pos:", driverPos);
  console.log("Pickup:", rideData?.pickup);
  console.log("Destination:", rideData?.destination);

  // ✅ Default fallback location
  const defaultCenter = {
    lat: rideData?.pickup?.lat || driverPos?.lat || 32.2518,
    lng: rideData?.pickup?.lng || driverPos?.lng || 75.5731,
  };

  let routeOrigin = null;
  let routeDestination = null;

  if (rideStatus === "accepted" || rideStatus === "arrived_at_pickup") {
    routeOrigin = driverPos;
    routeDestination = rideData?.pickup;
  } else if (rideStatus === "in_progress") {
    routeOrigin = driverPos;
    routeDestination = rideData?.destination;
  }

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <APIProvider
        apiKey={import.meta.env.VITE_Maps_API_KEY}
        libraries={["routes"]}
      >
        <Map
          defaultCenter={defaultCenter}
          defaultZoom={15}
          style={{ width: "100%", height: "100%" }}
          mapId={import.meta.env.VITE_MAP_ID}
        >
          {/* ✅ Driver marker */}
          {driverPos && (
            <PassengerMarker
              lat={driverPos.lat}
              lng={driverPos.lng}
              iconUrl="http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
              altText="Driver"
            />
          )}

          {/* ✅ Pickup marker */}
          {rideData?.pickup && (
            <PassengerMarker
              lat={rideData.pickup.lat}
              lng={rideData.pickup.lng}
              iconUrl="http://maps.google.com/mapfiles/ms/icons/green-dot.png"
              altText="Pickup"
            />
          )}

          {/* ✅ Dropoff marker */}
          {rideData?.destination && (
            <PassengerMarker
              lat={rideData.destination.lat}
              lng={rideData.destination.lng}
              iconUrl="http://maps.google.com/mapfiles/ms/icons/red-dot.png"
              altText="Dropoff"
            />
          )}

          {/* ✅ Directions */}
          {routeOrigin && routeDestination && (
            <PassengerDirectionsRenderer
              origin={routeOrigin}
              destination={routeDestination}
              setEta={setEta}
              setDistance={setDistance}
            />
          )}

          {/* ✅ ETA InfoWindow */}
          {eta && routeDestination && (
            <PassengerInfoWindow
              lat={routeDestination.lat}
              lng={routeDestination.lng}
              label={rideStatus === "in_progress" ? "Dropoff" : "Pickup"}
              time={eta}
            />
          )}

          {/* 🔴 Live Traffic Layer */}
          <TrafficLayerComponent />
        </Map>
      </APIProvider>
    </div>
  );
};

export default PassengerRideMap;