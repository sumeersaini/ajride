import React, { useState, useEffect, useRef, useCallback } from 'react';
import { APIProvider, useMapsLibrary } from '@vis.gl/react-google-maps';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faLocationArrow, faDotCircle, faStopCircle } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import toast from "react-hot-toast";

const Maps_API_KEY = import.meta.env.VITE_Maps_API_KEY;

import '../styles/SearchBar.css';
const AutocompleteInput = ({ placeholder, onPlaceSelected, showLocationButton = false }) => {
  const [value, setValue] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [selectionMade, setSelectionMade] = useState(false);
  const autocompleteService = useRef(null);
  const placesService = useRef(null);
  const geocoder = useRef(null);
  const sessionToken = useRef(null);
  const mapsLib = useMapsLibrary('places');

  useEffect(() => {
    if (mapsLib && !autocompleteService.current) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      placesService.current = new window.google.maps.places.PlacesService(document.createElement('div'));
      geocoder.current = new window.google.maps.Geocoder();
      sessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
    }
  }, [mapsLib]);

  const fetchPredictions = useCallback(() => {
    if (value && autocompleteService.current && sessionToken.current && !selectionMade) {
      autocompleteService.current.getPlacePredictions(
        {
          input: value,
          sessionToken: sessionToken.current,
        },
        (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            setPredictions(results || []);
          } else {
            setPredictions([]);
          }
        }
      );
    } else {
      setPredictions([]);
    }
  }, [value, selectionMade]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchPredictions();
    }, 300);
    return () => clearTimeout(handler);
  }, [value, fetchPredictions]);

  const handleSelect = (prediction) => {
    setSelectionMade(true);
    setValue(prediction.description);
    setPredictions([]);

    if (placesService.current && sessionToken.current) {
      placesService.current.getDetails(
        {
          placeId: prediction.place_id,
          fields: ['geometry.location', 'name', 'place_id'],
          sessionToken: sessionToken.current,
        },
        (place, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
            const location = place.geometry?.location;
            if (location) {
              onPlaceSelected({
                name: place.name,
                lat: location.lat(),
                lng: location.lng(),
                place_id: place.place_id,
              });
            }
          }
          sessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
        }
      );
    }
  };

  const handleInputChange = (e) => {
    setValue(e.target.value);
    setSelectionMade(false);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation || !geocoder.current) {
      toast.error('Geolocation not supported.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        geocoder.current.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const place = results[0];
            setValue(place.formatted_address);
            setSelectionMade(true);
            onPlaceSelected({
              name: place.formatted_address,
              lat,
              lng,
              place_id: place.place_id || '',
            });
          } else {
            toast.error('Failed to retrieve address.');
          }
        });
      },
      () => toast.error('Unable to access your location.')
    );
  };

  return (
    <div className="autocomplete-wrapper" style={{ position: 'relative' }}>
      <input
        className="autocomplete-input location-auto-complete"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        style={{ width: '100%', padding: '0.5rem', paddingRight: showLocationButton ? '2rem' : '0.5rem' }}
      />
      {showLocationButton && (
        <div onClick={handleUseCurrentLocation} className="current-location-set">
          <FontAwesomeIcon icon={faLocationArrow} className="input-icon location-icon" />
        </div>
      )}
      {!selectionMade && predictions.length > 0 && (
        <ul className="autocomplete-suggestions" style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'white',
          border: '1px solid #ccc',
          zIndex: 1000,
          listStyle: 'none',
          margin: 0,
          padding: 0,
        }}>
          {predictions.map((prediction) => (
            <li key={prediction.place_id} onClick={() => handleSelect(prediction)} style={{ padding: '0.5rem', cursor: 'pointer' }}>
              {prediction.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const SearchBar = () => {
  const [pickup, setPickup] = useState(null);
  const [destination, setDestination] = useState(null);
  const navigate = useNavigate();

  const handleStartBooking = () => {
    if (!pickup || !destination) {
      toast.error('Please select both pickup and destination.');
      return;
    }

    // Save to localStorage
    localStorage.setItem('booking_pickup', JSON.stringify(pickup));
    localStorage.setItem('booking_destination', JSON.stringify(destination));

    navigate('/booking-step1');
  };

  return (
    <APIProvider apiKey={Maps_API_KEY} libraries={['places']}>
      <div className="search-bar">
        <div className="location-input-group" style={{ position: 'relative' }}>
          <FontAwesomeIcon icon={faDotCircle} className="input-icon" style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)' }} />
          <div style={{ paddingLeft: '30px' }}>
            <AutocompleteInput
              placeholder="Enter Pickup Location"
              onPlaceSelected={setPickup}
              showLocationButton={true}
            />
          </div>
        </div>

        <div className="location-input-group" style={{ position: 'relative' }}>
          <FontAwesomeIcon icon={faStopCircle} className="input-icon" style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)' }} />
          <div style={{ paddingLeft: '30px' }}>
            <AutocompleteInput
              placeholder="Enter Destination"
              onPlaceSelected={setDestination}
            />
          </div>
        </div>

        <button className="search-button" onClick={handleStartBooking} style={{ padding: '0.5rem 1rem' }}>
          <FontAwesomeIcon icon={faSearch} /> Find Your Ride
        </button>
      </div>
    </APIProvider>
  );
};

export default SearchBar;
