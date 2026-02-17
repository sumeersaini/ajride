import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  APIProvider,
  useMapsLibrary,
  Map,
  Marker,
} from "@vis.gl/react-google-maps";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationArrow, faDotCircle } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";
import { getDriverStatus, addOrUpdateStatus } from "../api/driver";
import { useAuth } from "../context/AuthContext";
import "../styles/DriverStatus.css";

const Maps_API_KEY = import.meta.env.VITE_Maps_API_KEY;
const VITE_MAP_ID = import.meta.env.VITE_MAP_ID;

// --- Autocomplete Input (unchanged) ---
const AutocompleteInput = ({
  placeholder,
  onPlaceSelected,
  showLocationButton = false,
  value,
  onChange,
  programmaticSet,
}) => {
  const [predictions, setPredictions] = useState([]);
  const [selectionMade, setSelectionMade] = useState(false);
  const [suppressPredictions, setSuppressPredictions] = useState(false);
  const autocompleteService = useRef(null);
  const placesService = useRef(null);
  const geocoder = useRef(null);
  const sessionToken = useRef(null);
  const mapsLib = useMapsLibrary("places");

  useEffect(() => {
    if (mapsLib && !autocompleteService.current) {
      autocompleteService.current =
        new window.google.maps.places.AutocompleteService();
      placesService.current = new window.google.maps.places.PlacesService(
        document.createElement("div")
      );
      geocoder.current = new window.google.maps.Geocoder();
      sessionToken.current =
        new window.google.maps.places.AutocompleteSessionToken();
    }
  }, [mapsLib]);

  useEffect(() => {
    if (programmaticSet) {
      setSelectionMade(true);
      setSuppressPredictions(true);
      setPredictions([]);
      setTimeout(() => setSuppressPredictions(false), 300);
    }
  }, [programmaticSet]);

  const fetchPredictions = useCallback(() => {
    if (
      value &&
      autocompleteService.current &&
      sessionToken.current &&
      !selectionMade &&
      !suppressPredictions
    ) {
      autocompleteService.current.getPlacePredictions(
        { input: value, sessionToken: sessionToken.current },
        (results, status) => {
          setPredictions(
            status === window.google.maps.places.PlacesServiceStatus.OK
              ? results
              : []
          );
        }
      );
    } else setPredictions([]);
  }, [value, selectionMade, suppressPredictions]);

  useEffect(() => {
    const handler = setTimeout(fetchPredictions, 300);
    return () => clearTimeout(handler);
  }, [value, fetchPredictions]);

  const handleSelect = (prediction) => {
    placesService.current?.getDetails(
      {
        placeId: prediction.place_id,
        fields: [
          "geometry.location",
          "name",
          "place_id",
          "formatted_address",
        ],
        sessionToken: sessionToken.current,
      },
      (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          const location = place.geometry?.location;
          if (location) {
            const fullAddress =
              place.formatted_address || prediction.description;
            onChange(fullAddress);
            setSelectionMade(true);
            onPlaceSelected({
              name: fullAddress,
              lat: location.lat(),
              lng: location.lng(),
              place_id: place.place_id,
            });
          }
        }
        sessionToken.current =
          new window.google.maps.places.AutocompleteSessionToken();
      }
    );
  };

  const handleInputChange = (e) => {
    onChange(e.target.value);
    setSelectionMade(false);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation || !geocoder.current)
      return toast.error("Geolocation not supported.");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        geocoder.current.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === "OK" && results[0]) {
            const fullAddress = results[0].formatted_address || "";
            onChange(fullAddress);
            setSelectionMade(true);
            onPlaceSelected({
              name: fullAddress,
              lat,
              lng,
              place_id: results[0].place_id || "",
            });
          } else toast.error("Failed to retrieve address.");
        });
      },
      () => toast.error("Unable to access your location.")
    );
  };

  return (
    <div className="autocomplete-wrapper">
      <input
        className="autocomplete-input form-control"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
      />
      {showLocationButton && (
        <div
          onClick={handleUseCurrentLocation}
          className="current-location-set"
        >
          <FontAwesomeIcon
            icon={faLocationArrow}
            className="input-icon location-icon"
          />
        </div>
      )}
      {!selectionMade && predictions.length > 0 && (
        <ul className="autocomplete-suggestions">
          {predictions.map((prediction) => (
            <li
              key={prediction.place_id}
              onClick={() => handleSelect(prediction)}
            >
              {prediction.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// --- Main DriverStatus Component ---
const DriverStatus = () => {
  const { accessToken } = useAuth();
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [programmaticSet, setProgrammaticSet] = useState(false);
  const [formData, setFormData] = useState({
    status: "",
    lat: "",
    lng: "",
    current_place: "",
  });

  useEffect(() => {
    const fetchStatus = async () => {
      if (!accessToken) return;

      try {
        const res = await getDriverStatus({}, accessToken);

        if (res?.status === 200 && res.data.data) {
          const data = res.data.data;
          setProgrammaticSet(true);
          setFormData({
            status: data.status || "",
            lat: data.lat,
            lng: data.lng,
            current_place: data.current_place || "",
          });
          if (data.lat && data.lng) {
            setCurrentLocation({ lat: data.lat, lng: data.lng });
          }
        }
      } catch (err) {
        toast.error("Failed to fetch driver status.");
      }
    };
    fetchStatus();
  }, [accessToken]);

  useEffect(() => {
    if (programmaticSet) {
      const t = setTimeout(() => setProgrammaticSet(false), 300);
      return () => clearTimeout(t);
    }
  }, [programmaticSet]);

  const handlePlaceSelected = (loc) => {
    setCurrentLocation(loc);
    setFormData((prev) => ({
      ...prev,
      lat: loc.lat,
      lng: loc.lng,
      current_place: loc.name,
    }));
  };

  // --- Submit Driver Status ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.status || !formData.current_place) {
      return toast.error("Please select both a location and status.");
    }

    try {
      setLoading(true);

      // ✅ Just update driver status (no token handling here)
      await addOrUpdateStatus(formData, accessToken);

      toast.success("Driver status updated successfully!");
    } catch (err) {
      toast.error("Failed to submit status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <APIProvider apiKey={Maps_API_KEY} libraries={["places"]}>
      <div className=" mt-4">
        <div className="row">
          <div className="col-md-4">
            <form onSubmit={handleSubmit} className="driver-status-form">
              <div className="form-group position-relative mb-3">
                <FontAwesomeIcon icon={faDotCircle} className="input-icon" />
                <AutocompleteInput
                  placeholder="Enter Current Location"
                  value={formData.current_place}
                  onChange={(val) =>
                    setFormData((prev) => ({ ...prev, current_place: val }))
                  }
                  onPlaceSelected={handlePlaceSelected}
                  showLocationButton
                  programmaticSet={programmaticSet}
                />
              </div>
              <div className="form-group mb-3">
                <label htmlFor="status">Driver Status</label>
                <select
                  id="status"
                  className="form-control"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                >
                  <option value="">-- Select Status --</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="busy">Busy</option>
                </select>
              </div>
              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={loading}
              >
                {loading ? "Updating..." : "Submit Status"}
              </button>
            </form>
          </div>
          <div className="col-md-8">
            {currentLocation && (
              <div className="driver-status-map">
                <Map
                  center={{
                    lat: currentLocation.lat,
                    lng: currentLocation.lng,
                  }}
                  zoom={14}
                  mapId={VITE_MAP_ID}
                  className="map-element"
                >
                  <Marker
                    position={{
                      lat: currentLocation.lat,
                      lng: currentLocation.lng,
                    }}
                  />
                </Map>
              </div>
            )}
          </div>
        </div>
      </div>
    </APIProvider>
  );
};

export default DriverStatus;
