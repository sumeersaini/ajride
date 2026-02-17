import React from "react";
import Tags from "./Tags";

const CarDetails = ({ car }) => {
  return (
    <div className="details">
      <p><strong>{car?.location}</strong></p>
      <p>
        {car?.car_engine} · {car?.car_type}
      </p>
      <Tags />
      <p className="description">{car?.descriptions}</p>
    </div>
  );
};

export default CarDetails;
