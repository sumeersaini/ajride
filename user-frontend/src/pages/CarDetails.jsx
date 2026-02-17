import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Slider from "react-slick";
import { supabase } from "../services/supabaseClient";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const apiUrl = import.meta.env.VITE_BACKEND_API_URL;

export default function CarDetails() {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  useEffect(() => {
    async function fetchCarDetails() {
      setLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session || !session.user) {
          throw new Error("User session not found");
        }

        const uuid = session.user.id;

        const response = await axios.post(
          `${apiUrl}/api/merchant/get_car_by_id`,
          { uuid, id: parseInt(id) },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data && response.data.data) {
          setCar(response.data.data);
        }
      } catch (err) {
        console.error("Failed to load car:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCarDetails();
  }, [id]);


 if (loading) return<div className="loading-cr">
                    <img  src="/loading-cr.svg" className="loading-cls"/>
                </div>;


  if (!car) return <div>Car not found.</div>;

  const imageUrls = car.images.split(",");

    const sliderSettings = {
    dots: true,
    arrows: true, 
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
    };
  return (
    
    <div  className="col-md-6 host-pages">
   
        <div className="car-details-page">
          <div className="edit-car-btn">
           <button
              className="btn gap-2"
              onClick={() => navigate(`/edit-car/${car.id}`)}
            >
              <FontAwesomeIcon icon={faEdit} />
            </button>
          </div>
        <h2 className="mb-4">{car.car_name}</h2>

        {/* Image Slider */}
        {/* <Slider {...sliderSettings}>
            {imageUrls.map((url, index) => (
            <div key={index}>
                <img
                    src={url}
                    alt={`Car Image ${index + 1}`}
                    style={{ maxHeight: "400px", objectFit: "cover", width: "100%" }}
                />
            </div>
            ))}
        </Slider> */}

        <Slider {...sliderSettings}>
          {imageUrls.map((url, index) => (
            <div
              key={index}
              style={{
                height: "300px", // fixed height
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#f4f4f4", // optional: for visual consistency
                overflow: "hidden",
              }}
            >
              <img
                src={url}
                alt={`Car Image ${index + 1}`}
                style={{
                  minWidth: "100%",
                  maxWidth: "100%",         // maintain aspect ratio
                  minHeight: "300px",    // same as container
                  maxHeight: "300px",    // strictly enforce
                  objectFit: "cover",    // fill the box, crop if needed
                  borderRadius: "8px",
                }}
              />
            </div>
          ))}
        </Slider>

        <div className="mt-4">
            <p><strong>Type:</strong> {car.car_type}</p>
            <p><strong>Engine:</strong> {car.car_engine}</p>
            <p><strong>Location:</strong> {car.location || "N/A"}</p>
            {/* <p><strong>Transmission:</strong> {car.transmission || "N/A"}</p> */}
            <p><strong>Price per Mile:</strong> ${car.price_per_mile} CAD</p>
            <p><strong>Owner:</strong> {car.owner_name}</p>
            <p><strong>Date:</strong> {new Date(car.createdAt).toLocaleString()}</p>
             <p><strong>Description:</strong> {car.descriptions}</p>
        </div>
        </div>
    </div>
  );
}
