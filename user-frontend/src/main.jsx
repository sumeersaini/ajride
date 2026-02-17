import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.jsx';

import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap styles
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Import Bootstrap JS for interactivity

import './styles/custom.css'; // Import your custom CSS file globally

// Import APIProvider from @vis.gl/react-google-maps
import { APIProvider } from '@vis.gl/react-google-maps';

// Get your API key and Map ID from environment variables
// Ensure these are set in your .env file at the root of your project:
// VITE_Maps_API_KEY=YOUR_ACTUAL_Maps_API_KEY_HERE
// VITE_MAP_ID=YOUR_ACTUAL_GOOGLE_MAP_ID_HERE
const googleMapsApiKey = import.meta.env.VITE_Maps_API_KEY;
const MAP_ID = import.meta.env.VITE_MAP_ID; // This should be the Map ID you created in Google Cloud Console

// Check if API key or Map ID are missing (optional, but good for debugging)
if (!googleMapsApiKey) {
  console.error("VITE_Maps_API_KEY is not defined in your .env file.");
  // alert("Google Maps API Key is missing. Please check your .env file.");
}
if (!MAP_ID) {
  console.error("VITE_MAP_ID is not defined in your .env file or is empty.");
  // alert("Google Maps Map ID is missing. Please create one in Google Cloud Console and add it to your .env file.");
}


createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Wrap your entire App with APIProvider */}
    {/* It's crucial to pass your API Key and Map ID here */}
    {/* <APIProvider
      apiKey={googleMapsApiKey}
      solutionChannel="GMP_DEV_Ajride_App" // Optional, but good for Google to track usage
      mapIds={[MAP_ID]} // Pass your Map ID here
    > */}
      <App />
    {/* </APIProvider> */}
  </StrictMode>,
);