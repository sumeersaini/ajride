// src/components/DriverMapComponents.jsx
import React, { useEffect, useState, memo } from 'react';
import {
    APIProvider,
    Map,
    useMapsLibrary,
    useMap,
    AdvancedMarker,
    InfoWindow,
} from "@vis.gl/react-google-maps";
import { DriverMapInfoBox } from './DriverMapInfoBox';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationCrosshairs } from "@fortawesome/free-solid-svg-icons";

// 🚗 Driver car icon marker
export const DriverImageMarker = ({ lat, lng, iconUrl, altText }) => {
    return (
        <AdvancedMarker position={{ lat, lng }}>
            <img src={iconUrl} alt={altText} style={{ width: 32, height: 32 }} />
        </AdvancedMarker>
    );
};

// 🚶 Passenger pickup marker
export const PassengerPickupMarker = ({ lat, lng }) => {
    return (
        <AdvancedMarker position={{ lat, lng }}>
            <img
                src="https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png"
                alt="Passenger Pickup"
                style={{ width: 28, height: 28 }}
            />
        </AdvancedMarker>
    );
};

// InfoWindow only (no visible marker)
export const DriverMarkerInfoWindow = ({ lat, lng, label, time, isPickup }) => {
    const infoWindowClass = isPickup ? "pickup-infowindow" : "dropoff-infowindow";

    return (
        <>
            <AdvancedMarker position={{ lat, lng }}>
                <img
                    src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
                    alt=""
                    style={{ display: 'none' }}
                />
            </AdvancedMarker>

            <InfoWindow
                position={{ lat, lng }}
                options={{ pixelOffset: new window.google.maps.Size(0, -30) }}
            >
                <div className={infoWindowClass}>
                    <div className="infowindow-time-box">
                        <span>{isPickup ? 'ETA:' : 'Trip:'}</span><br />
                        <strong>{time || 'Now'}</strong>
                    </div>
                    <div className="infowindow-label-box">
                        <strong>{label}</strong>
                    </div>
                </div>
            </InfoWindow>
        </>
    );
};

// 🛣️ Route rendering with markers suppressed
export const DriverDirectionsRendererComponent = memo(({
    origin,
    destination,
    setEta,
    setDistance,
}) => {
    const map = useMap();
    const routesLibrary = useMapsLibrary("routes");
    const [directionsService, setDirectionsService] = useState(null);
    const [directionsRenderer, setDirectionsRenderer] = useState(null);

    useEffect(() => {
        if (!routesLibrary || !map) return;

        setDirectionsService(new routesLibrary.DirectionsService());
        setDirectionsRenderer(
            new routesLibrary.DirectionsRenderer({
                map,
                suppressMarkers: true,
            })
        );
    }, [routesLibrary, map]);

    useEffect(() => {
        if (!directionsService || !directionsRenderer || !destination || !origin) return;

        directionsService.route(
            {
                origin,
                destination,
                travelMode: window.google.maps.TravelMode.DRIVING,
            },
            (result, status) => {
                if (status === "OK") {
                    directionsRenderer.setDirections(result);
                    const route = result.routes[0];
                    if (route.legs && route.legs.length > 0) {
                        setEta(route.legs[0].duration.text);
                        setDistance(route.legs[0].distance.text);
                    }
                } else {
                    console.error(`Directions request failed due to ${status}`);
                }
            }
        );
    }, [directionsService, directionsRenderer, origin, destination, setEta, setDistance]);

    return null;
});

// 🎯 Button to recenter map
const RecenterButton = ({ position }) => {
    const map = useMap();
    const recenter = () => {
        if (map && position) {
            map.setCenter(position);
        }
    };
    return (
        <button className="recenter-button" onClick={recenter}>
            <FontAwesomeIcon icon={faLocationCrosshairs} />
        </button>
    );
};

// 🔴 Live Traffic Layer component
const TrafficLayerComponent = () => {
    const map = useMap();
    const mapLibrary = useMapsLibrary('maps');

    useEffect(() => {
        if (!map || !mapLibrary) {
            return;
        }

        const trafficLayer = new mapLibrary.TrafficLayer();
        trafficLayer.setMap(map);

        return () => {
            trafficLayer.setMap(null); // Cleanup
        };
    }, [map, mapLibrary]);

    return null;
};

// 🌍 Main Driver Map Component
const DriverRideMap = ({
    driverPos,
    rideData,
    eta,
    distance,
    geoError,
    setEta,
    setDistance,
    rideStatus
}) => {
    const mapCenter = driverPos || rideData?.pickup || { lat: 0, lng: 0 };

    let routeOrigin = null;
    let routeDestination = null;

    if (rideStatus === 'accepted' || rideStatus === 'arrived_at_pickup') {
        routeOrigin = driverPos;
        routeDestination = rideData?.pickup;
    } else if (rideStatus === 'in_progress') {
        routeOrigin = driverPos;
        routeDestination = rideData?.destination;
    }

    return (
        <div className="ride-map">
            {geoError && <p className="geo-error">⚠️ {geoError}</p>}

            <APIProvider
                apiKey={import.meta.env.VITE_Maps_API_KEY}
                mapId={import.meta.env.VITE_MAP_ID}
            >
                <Map
                    defaultZoom={15}
                    defaultCenter={mapCenter}
                    style={{ width: "100%", height: "100%" }}
                    mapId={import.meta.env.VITE_MAP_ID}
                >
                    {/* 🚗 Driver marker */}
                    {driverPos && (
                        <DriverImageMarker
                            lat={driverPos.lat}
                            lng={driverPos.lng}
                            iconUrl='https://tychnbchdeltmyiwzpur.supabase.co/storage/v1/object/public/ajride/website/map-car64.png'
                            altText='Driver'
                        />
                    )}

                    {/* 🚶 Passenger pickup marker */}
                    {rideData?.pickup && (
                        <PassengerPickupMarker
                            lat={rideData.pickup.lat}
                            lng={rideData.pickup.lng}
                        />
                    )}

                    {/* 🛣️ Route */}
                    {routeOrigin && routeDestination && (
                        <DriverDirectionsRendererComponent
                            origin={routeOrigin}
                            destination={routeDestination}
                            setEta={setEta}
                            setDistance={setDistance}
                        />
                    )}

                    {/* 🪧 Pickup InfoWindow */}
                    {eta && rideData?.pickup && (rideStatus === 'accepted' || rideStatus === 'arrived_at_pickup') && (
                        <DriverMarkerInfoWindow
                            lat={rideData.pickup.lat}
                            lng={rideData.pickup.lng}
                            label={rideData.pickup.name}
                            time={eta}
                            isPickup={true}
                        />
                    )}

                    {/* 🪧 Dropoff InfoWindow */}
                    {eta && rideData?.destination && rideStatus === 'in_progress' && (
                        <DriverMarkerInfoWindow
                            lat={rideData.destination.lat}
                            lng={rideData.destination.lng}
                            label={rideData.destination.name}
                            time={eta}
                            isPickup={false}
                        />
                    )}

                    {/* 🧭 Floating ETA + distance */}
                    {distance && <DriverMapInfoBox eta={eta} distance={distance} />}

                    {/* 🔴 Live Traffic Layer */}
                    <TrafficLayerComponent />

                    <RecenterButton position={driverPos} />
                </Map>
            </APIProvider>
        </div>
    );
};

export default DriverRideMap;