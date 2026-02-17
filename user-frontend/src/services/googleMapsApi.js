import { useEffect, useRef, useCallback } from 'react';
// We don't need useMapsLibrary('places') here anymore since gmp-place-autocomplete handles it internally.
// import { useMapsLibrary } from '@vis.gl/react-google-maps'; // REMOVE THIS LINE

// --- Hook for gmp-place-autocomplete integration ---
export const usePlaceAutocompleteElement = (elementRef, onPlaceSelected) => {
    // const places = useMapsLibrary('places'); // REMOVE THIS LINE (No longer needed here)

    // setInputValue is for programmatically setting the *visual* value of the web component
    const setInputValue = useCallback((text) => {
        if (elementRef.current) {
            // This is the correct way to set the value for gmp-place-autocomplete web component
            elementRef.current.value = text;
            console.log(`setInputValue: Set value for '${elementRef.current.placeholder || 'autocomplete'}' to: '${text}'`);
        } else {
            console.warn("setInputValue: elementRef.current is null. Cannot set input value.");
        }
    }, [elementRef]);

    useEffect(() => {
        const element = elementRef.current;

        // CRITICAL CHECK: Ensure the DOM element exists
        if (!element) {
            console.log(`usePlaceAutocompleteElement useEffect: Waiting for DOM element for ref:`, elementRef);
            return;
        }

        // REMOVE THE FOLLOWING BLOCK - It's creating the error!
        // if (!autocompleteInstance.current) {
        //     console.log(`usePlaceAutocompleteElement useEffect: Initializing Autocomplete service for element with placeholder: '${element.placeholder || 'N/A'}'`);
        //     autocompleteInstance.current = new places.Autocomplete(element);
        // }

        // We are now listening directly to the gmp-place-autocomplete web component's event
        console.log(`usePlaceAutocompleteElement useEffect: Attaching 'gmp-placechange' listener for element with placeholder: '${element.placeholder || 'N/A'}'`);

        const handlePlaceChange = (event) => {
            const place = event.detail; // The 'place' object is in event.detail for gmp-placechange
            console.log(`gmp-placechange event fired for '${element.placeholder || 'N/A'}'. Place detail:`, place);
            if (place && onPlaceSelected) {
                onPlaceSelected(place);
            } else if (!place) {
                console.warn(`gmp-placechange event fired but place detail is null/undefined for '${element.placeholder || 'N/A'}'.`);
            }
        };

        // Attach 'gmp-placechange' listener directly to the web component
        element.addEventListener('gmp-placechange', handlePlaceChange);
        console.log(`Listener 'gmp-placechange' ATTACHED to`, element);

        // Cleanup function: remove the event listener when the component unmounts
        return () => {
            element.removeEventListener('gmp-placechange', handlePlaceChange);
            console.log(`Listener 'gmp-placechange' DETACHED from`, element);
        };
    }, [elementRef, onPlaceSelected]); // Dependencies for useEffect

    return { setInputValue };
};

// --- Utility: Geocode latitude and longitude into address ---
// (Keep this as is, it's fine)
export const geocodeLatLng = async (lat, lng) => {
    if (!window.google || !window.google.maps || !window.google.maps.Geocoder) {
        console.error("geocodeLatLng: Google Maps Geocoder API not loaded. Ensure APIProvider is used in your root component.");
        throw new Error("Google Maps Geocoder API not loaded.");
    }
    const geocoder = new window.google.maps.Geocoder();
    return new Promise((resolve, reject) => {
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
            if (status === 'OK' && results[0]) {
                console.log("geocodeLatLng: Geocoded address:", results[0].formatted_address);
                resolve(results[0].formatted_address);
            } else {
                console.error('geocodeLatLng: Geocoder failed due to: ' + status, results);
                reject(new Error('Geocoder failed: ' + status));
            }
        });
    });
};

// --- Utility: Get user's current geolocation (uses native browser API) ---
// (Keep this as is, it's fine)
export const getCurrentBrowserLocation = () => {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            console.log("getCurrentBrowserLocation: Requesting current browser location...");
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const coords = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    console.log("getCurrentBrowserLocation: Successfully obtained location:", coords);
                    resolve(coords);
                },
                (error) => {
                    console.error("getCurrentBrowserLocation: Error getting current location:", error);
                    let errorMessage = "Unknown error.";
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = "User denied the request for Geolocation.";
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = "Location information is unavailable.";
                            break;
                        case error.TIMEOUT:
                            errorMessage = "The request to get user location timed out.";
                            break;
                        case error.UNKNOWN_ERROR:
                            errorMessage = "An unknown error occurred.";
                            break;
                    }
                    reject(new Error(`Geolocation error: ${errorMessage}`));
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        } else {
            console.warn("getCurrentBrowserLocation: Geolocation is not supported by this browser.");
            reject(new Error("Geolocation is not supported by this browser."));
        }
    });
};

// --- Utility: Get full place details using placeId ---
// (Keep this as is, it's fine)
export const getPlaceDetailsById = (placeId) => {
    return new Promise((resolve, reject) => {
        if (!window.google || !window.google.maps || !window.google.maps.places || !window.google.maps.places.PlacesService) {
            console.error("getPlaceDetailsById: Google Maps PlacesService is not available. Ensure APIProvider is used in your root component.");
            reject("Google Maps PlacesService is not available.");
            return;
        }

        const service = new window.google.maps.places.PlacesService(
            document.createElement('div')
        );

        console.log("getPlaceDetailsById: Fetching details for placeId:", placeId);
        service.getDetails({ placeId }, (place, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
                console.log("getPlaceDetailsById: Successfully fetched place details:", place);
                resolve(place);
            } else {
                console.error(`getPlaceDetailsById: Failed to get place details: ${status}`, place);
                reject(`Failed to get place details: ${status}`);
            }
        });
    });
};