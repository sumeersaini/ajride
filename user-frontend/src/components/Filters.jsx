import React from "react";

const Filters = () => {
  const filterItems = ["Amazing cars", "Luxury", "SUV", "Electric", "4x4", "Classic"];
  return (
    <div className="filters">
      {filterItems.map((item, index) => (
        <div key={index}>{item}</div>
      ))}
    </div>
  );
};

export default Filters;
