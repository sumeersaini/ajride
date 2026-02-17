import React from "react";
import "../styles/FullScreenLoader.css"; // create this CSS file

const FullScreenLoader = () => {
  return (
    <div className="fullscreen-loader">
      <img src="/loading-new.svg" alt="Loading..." className="loader-image" />
    </div>
  );
};

export default FullScreenLoader;
