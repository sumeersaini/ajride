import React, { useEffect, useState } from "react";
import CarGallery from "../components/CarGallery";
import CarDetails from "../components/CarDetails";
import CarBookingForm from "../components/CarBookingForm";
import { supabase } from "../services/supabaseClient";
// import "../index.css";

import { useParams } from "react-router-dom";
const apiUrl = import.meta.env.VITE_BACKEND_API_URL;

const CarBooking = () => {
  const [carData, setCarData] = useState(null);
  const { id } = useParams();
  useEffect(() => {
    const fetchCar = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session || !session.user) {
          throw new Error("User session not found");
        }

        const uuid = session.user.id;

        const response = await fetch(`${apiUrl}/api/get_car_by_id`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uuid: uuid,
            id: id,
          }),
        });

        const result = await response.json();
        if (result?.data) {
          setCarData(result.data);
        }
      } catch (error) {
        console.error("Error fetching car data:", error);
      }
    };

    fetchCar();
  }, []);

  if (!carData) return  <div className="loading-cr">
        <img src="/loading-cr.svg" className="loading-cls" />
      </div>;

  const imageArray = carData.images.split(",");

  return (
    <div className="car-booking-page col-md-8">
      <div className="booking-step-1">
        <h1 className="title">{carData.car_name} by {carData.owner_name}</h1>

        {/* Image gallery */}
        <CarGallery images={imageArray} />

        {/* Details and booking form side-by-side */}
        <div className="info">
          <CarDetails car={carData} />
          <CarBookingForm />
        </div>
      </div>
    </div>
  );
};

export default CarBooking;
