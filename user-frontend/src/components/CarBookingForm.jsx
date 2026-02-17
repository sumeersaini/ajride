import React from "react";

const CarBookingForm = () => {
  return (
    <div className="booking">
      <p className="price">₹7,899 <span>for 2 days</span></p>
      <label>
        Pick-up Date: <input type="date" defaultValue="2025-07-10" />
      </label>
      <label>
        Drop-off Date: <input type="date" defaultValue="2025-07-12" />
      </label>
      <label>
        Driver Age:
        <select>
          <option>18+</option>
          <option>25+</option>
          <option>35+</option>
        </select>
      </label>
      <button className="reserve-btn">Book Now</button>
      <p className="note">You won’t be charged until confirmation</p>
    </div>
  );
};

export default CarBookingForm;
