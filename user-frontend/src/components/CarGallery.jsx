import React from "react";

const CarGallery = ({ images = [] }) => {
  if (images.length === 0) return null;

  return (
    <div className="image-gallery">
      {/* Main image */}
      <img src={images[0]} alt="Main Car View" />

      {/* Thumbnails */}
      <div className="thumbnail-row">
        {images.slice(1, 5).map((url, i) => (
          <img key={i} src={url} alt={`Car angle ${i + 1}`} />
        ))}
      </div>
    </div>
  );
};

export default CarGallery;
