// BookingStep1.jsx (updated to show nearby drivers on the map)

import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { APIProvider, Map, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import LocationMarker from '../components/LocationMarker';
import RideDetailsPanel from '../components/RideDetailsPanel';
import AvailableRides from '../components/AvailableRides';
import { useAuth } from '../context/AuthContext';
import { getPriceDetail } from '../api/booking';
import { calculateFare } from '../utils/calculateFare';
import '../styles/BookingStep.css';

const BookingMapWrapper = ({
  pickup,
  destination,
  setTotalDistanceKm,
  setRouteDurationText,
  routeDurationText,
  nearbyDrivers = [],
}) => {
  const [mapCenter, setMapCenter] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const mapInstance = useMap();
  const routesLibrary = useMapsLibrary('routes');

  useEffect(() => {
    if (!routesLibrary || !mapInstance || directionsRenderer) return;

    const renderer = new routesLibrary.DirectionsRenderer({
      map: mapInstance,
      polylineOptions: {
        strokeColor: '#4CAF50',
        strokeOpacity: 0.8,
        strokeWeight: 6,
      },
      suppressMarkers: true,
    });
    setDirectionsRenderer(renderer);
  }, [routesLibrary, mapInstance, directionsRenderer]);

  const calculateAndDisplayRoute = useCallback(() => {
    if (!directionsRenderer || !routesLibrary || !pickup || !destination) return;

    const directionsService = new routesLibrary.DirectionsService();

    directionsService.route(
      {
        origin: { lat: pickup.lat, lng: pickup.lng },
        destination: { lat: destination.lat, lng: destination.lng },
        travelMode: routesLibrary.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === routesLibrary.DirectionsStatus.OK && result) {
          directionsRenderer.setDirections(result);

          if (mapInstance && result.routes?.[0]) {
            const bounds = new window.google.maps.LatLngBounds();
            let totalDistance = 0;
            let durationText = '';

            result.routes[0].legs.forEach((leg) => {
              totalDistance += leg.distance.value;
              durationText = leg.duration?.text || '';
              leg.steps.forEach((step) =>
                step.path.forEach((latlng) => bounds.extend(latlng))
              );
            });

            mapInstance.fitBounds(bounds);
            setTotalDistanceKm((totalDistance / 1000).toFixed(2));
            setRouteDurationText(durationText);
          }
        } else {
          alert(`Error: ${status}. Please try different locations.`);
          directionsRenderer.setDirections({ routes: [] });
        }
      }
    );
  }, [directionsRenderer, routesLibrary, pickup, destination, mapInstance, setTotalDistanceKm, setRouteDurationText]);

  useEffect(() => {
    if (pickup && destination) {
      setMapCenter({
        lat: (pickup.lat + destination.lat) / 2,
        lng: (pickup.lng + destination.lng) / 2,
      });
      calculateAndDisplayRoute();
    } else if (pickup) {
      setMapCenter({ lat: pickup.lat, lng: pickup.lng });
    } else {
      setMapCenter({ lat: 28.6139, lng: 77.2090 });
    }
  }, [pickup, destination, calculateAndDisplayRoute]);

  if (!mapCenter) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading Map...</div>;
  }

  return (
    <div className="map-wrapper-container">
      <Map
        mapId={import.meta.env.VITE_MAP_ID}
        defaultCenter={mapCenter}
        defaultZoom={10}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        zoomControl={true}
        fullscreenControl={false}
        className="google-map"
      >
        <LocationMarker
          lat={pickup.lat}
          lng={pickup.lng}
          type="pickup"
          label={pickup.name || 'Pickup Location'}
          time="Now"
        />
        <LocationMarker
          lat={destination.lat}
          lng={destination.lng}
          type="dropoff"
          label={destination.name || 'Dropoff Location'}
          time={routeDurationText}
        />

        {nearbyDrivers.map((driver) => (
          <LocationMarker
            key={driver.uuid}
            lat={driver.lat}
            lng={driver.lng}
            type="driver"
            label={driver.type}
            time={driver.eta}
          />
        ))}
      </Map>
    </div>
  );
};

const BookingStep1 = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, accessToken } = useAuth();

  const [pickup, setPickup] = useState(null);
  const [destination, setDestination] = useState(null);
  const [totalDistanceKm, setTotalDistanceKm] = useState(null);
  const [routeDurationText, setRouteDurationText] = useState(null);
  const [fare, setFare] = useState(null);
  const [pricingConfig, setPricingConfig] = useState(null);
  const [showAvailableRides, setShowAvailableRides] = useState(false);
  const [nearbyDrivers, setNearbyDrivers] = useState([]);

  useEffect(() => {
    const statePickup = location.state?.pickup;
    const stateDestination = location.state?.destination;

    if (statePickup && stateDestination) {
      setPickup(statePickup);
      setDestination(stateDestination);
    } else {
      const storedPickup = localStorage.getItem('booking_pickup');
      const storedDestination = localStorage.getItem('booking_destination');

      if (storedPickup && storedDestination) {
        setPickup(JSON.parse(storedPickup));
        setDestination(JSON.parse(storedDestination));
      }
    }
  }, [location.state]);

  useEffect(() => {
    if (!user || !accessToken) return;

    const fetchPricing = async () => {
      try {
        const res = await getPriceDetail(accessToken);
        const data = res.data?.data;
        if (data) setPricingConfig(data);
      } catch (error) {
        console.error("Failed to fetch pricing config", error);
      }
    };

    fetchPricing();
  }, [user, accessToken]);

  useEffect(() => {
    if (!totalDistanceKm || !pricingConfig) return;

    const calculated = calculateFare(totalDistanceKm, pricingConfig);
    setFare(calculated);
  }, [totalDistanceKm, pricingConfig]);

  if (!pickup || !destination || pickup.lat == null || pickup.lng == null || destination.lat == null || destination.lng == null) {
    return (
      <div style={{ padding: '2rem', color: 'red', textAlign: 'center' }}>
        <h2>Booking data missing or incomplete.</h2>
        <button onClick={() => navigate('/')}>Go to Search</button>
      </div>
    );
  }

  return (
    <APIProvider apiKey={import.meta.env.VITE_Maps_API_KEY}>
      <div className="booking-step1-container">
        <div className="booking-page-top">
          <div className="ride-detail-bookingstep1">
            {!showAvailableRides ? (
              <RideDetailsPanel
                pickup={pickup}
                destination={destination}
                distance={totalDistanceKm}
                fare={fare}
                pricingConfig={pricingConfig}
                isLoggedIn={!!user}
                onModify={() => {
                  localStorage.removeItem('booking_pickup');
                  localStorage.removeItem('booking_destination');
                  navigate('/');
                }}
                onConfirm={() => setShowAvailableRides(true)}
              />
            ) : (
              <AvailableRides
                pickup={pickup}
                destination={destination}
                onBack={() => setShowAvailableRides(false)}
                distance={totalDistanceKm}
                setNearbyDrivers={setNearbyDrivers}
              />
            )}
          </div>

          <div className="map-bookingstep1">
            <BookingMapWrapper
              pickup={pickup}
              destination={destination}
              setTotalDistanceKm={setTotalDistanceKm}
              setRouteDurationText={setRouteDurationText}
              routeDurationText={routeDurationText}
              nearbyDrivers={nearbyDrivers}
            />
          </div>
        </div>
      </div>
    </APIProvider>
  );
};

export default BookingStep1;
