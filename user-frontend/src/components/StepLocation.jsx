import React, { useState } from "react";
import toast from "react-hot-toast";

const StepLocation = ({ next, update, data }) => {
  const [location, setLocation] = useState(data.location || "");

  const handleNext = () => {
    if (!location.trim()) {
      toast.error("Please enter a location");
      return;
    }
    update({ location });
    next();
  };

  // Example static map from OpenStreetMap (centered roughly at NYC)
  const staticMapUrl =
    "https://upload.wikimedia.org/wikipedia/commons/e/ec/Map_of_New_York_City.png";

  return (
    <div className="location-step car-pages-steps" style={{ minHeight: "550px" }}>
      <h2 className="text-xl font-bold mb-2">Location</h2>
      <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Your location"
        className="w-full p-2 border rounded location-input "
      />

      {/* Static map image below input */}
      <div className="static-map mt-4">
        {/* <img
          src={staticMapUrl}
          alt="Static map"
          style={{ width: "100%", maxHeight: "300px", borderRadius: "8px" }}
        /> */}
        
      {/* Optional: Replace iframe with <img src={staticMapUrl} /> if needed */}
      {/* <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d18867566.07182795!2d-123.49688418035679!3d54.74181853256009!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4b0d03d337cc6ad9%3A0x9968b72aa2438fa5!2sCanada!5e0!3m2!1sen!2sin!4v1748427193140!5m2!1sen!2sin"
        width="600"
        height="450"
        style={{ border: 0, width: '100%', maxHeight: '300px', borderRadius: '8px' }}
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Google Map"
      ></iframe> */}
 
      </div>

      <div className="next-button-container" style={{ marginTop: "auto", display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={handleNext}
          className="bg-blue-500 text-white px-4 py-2 rounded nxt-btn"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default StepLocation;
