import React, { useEffect, useState } from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';

const MapPolyline = ({ path }) => {
  // Hook to access the map instance
  const map = useMap();
  // Hook to load the 'maps' library which contains the Polyline class
  const mapsLib = useMapsLibrary('maps');

  const [polyline, setPolyline] = useState(null);

  useEffect(() => {
    // Ensure both the map and the maps library are loaded before proceeding
    if (!map || !mapsLib || !path || path.length < 2) return;

    // Create a new Polyline instance
    const newPolyline = new mapsLib.Polyline({
      path: path,
      map: map,
      strokeColor: '#34A853',
      strokeOpacity: 0.8,
      strokeWeight: 4,
    });

    setPolyline(newPolyline);

    // Clean up the polyline when the component unmounts
    return () => {
      newPolyline.setMap(null);
    };
  }, [map, mapsLib, path]);

  return null; // This component doesn't render any JSX directly
};

export default MapPolyline;