// loadGoogleMaps.js
let googleMapsPromise = null;

export function loadGoogleMaps(apiKey) {
  if (typeof window.google !== "undefined" && window.google.maps) {
    return Promise.resolve(window.google);
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector("script[src*='maps.googleapis.com/maps/api/js']");
    
    if (existingScript) {
      existingScript.addEventListener("load", () => {
        if (window.google && window.google.maps) {
          resolve(window.google);
        } else {
          reject(new Error("Google Maps script loaded but window.google.maps is undefined"));
        }
      });
      existingScript.addEventListener("error", reject);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=weekly`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.google && window.google.maps) {
        resolve(window.google);
      } else {
        reject(new Error("Google Maps script loaded but window.google.maps is undefined"));
      }
    };

    script.onerror = reject;

    document.head.appendChild(script);
  });

  return googleMapsPromise;
}
