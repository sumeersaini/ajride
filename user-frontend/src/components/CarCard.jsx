import React, { useState } from "react";
import { Star } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

import { Link } from "react-router-dom";

const CarCard = ({ title, rating, price, images, id }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const moveSlide = (direction) => {
    const newIndex = (currentIndex + direction + images.length) % images.length;
    setCurrentIndex(newIndex);
  };

  // console.log("images",images.length)
  return (  
    <div className="home-page-cards col-md-3">
       
      <div className="card">
        {/* Image slider */}
        <div className="card-slider relative overflow-hidden">
          <div
            className="slides flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
            }}
          >
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`slide-${i}`}
                className="w-full flex-shrink-0 object-cover"
              />
            ))}
          </div>

          {/* Navigation arrows */}
          {images.length > 1 ? <><button
            onClick={() => moveSlide(-1)}
            className="prev absolute "
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <button
            onClick={() => moveSlide(1)}
            className="next absolute"
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button></>:""}
          
        </div>

        {/* Card content */}
        {/* <Link to={`/car-booking/${id}`} className="block"> */}
        <a href={`/car-booking/${id}`} target="_blank" rel="noopener noreferrer" className="block">

        <div className="card-content p-4">
          <h4 className="text-xl font-semibold text-gray-900">{title}</h4>
          <div className="flex items-center mt-1 text-gray-800 font-medium text-sm rating-tg">
            <Star className="w-4 h-4 text-yellow-500 mr-1 " />
            {rating.toFixed(2)}
          </div>
          <p className=" mt-2 price-tg">
            Price <span className="">${price}S</span>/h
          </p>
        </div>
        </a>
        {/* </Link> */}
      </div>
      
    </div>
  );
};

export default CarCard;
