import React, { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import SearchBar from '../components/SearchBar';
import Filters from '../components/Filters';
import CarCard from '../components/CarCard';
import FullScreenLoader from '../components/FullScreenLoader';

import HomeBookingSteps from '../components/HomeBookingSteps';
import Innovations from '../components/Innovations'
import PlanLater from '../components/PlanLater'

const apiUrl     = import.meta.env.VITE_BACKEND_API_URL;

export default function Home() {
  const [carList, setCarList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // const fetchCars = async () => {
    //   try {
    //     const response = await fetch(`${apiUrl}/api/get_list_cars`, {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json'
    //       }
    //     });

    //     const result = await response.json();

    //     if (response.ok && result?.data) {
    //       const formattedCars = result.data.map(car => ({
    //         id:car.id,
    //         title: car.car_name,
    //         rating: 4.9, // You can replace this with actual rating if available
    //         price: car.price_per_mile,
    //         images: car.images.split(',').map(url => url.trim()), // Convert comma-separated string to array
    //         owner_name: car.owner_name,
    //         car_type: car.car_type,
    //         engine: car.car_engine,
    //         description: car.descriptions,
    //       }));

    //       setCarList(formattedCars);
    //     } else {
    //       console.error("Failed to load car data", result.message);
    //     }
    //   } catch (err) {
    //     console.error("Error fetching car list:", err);
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    // fetchCars();
  }, []);

  return (
    <div className="home-page">
      <div className="home-banner">
        <div className="search-box">
          <span className="home-title-display-block">
            <h1>Book a ride instantly or schedule it for later!</h1>
             
          </span>
          <div className="home-caption ">
              ✓ No Hidden Costs       ✓ 24/7 Support       ✓ Free Cancellation
          </div>
          <SearchBar />
        </div>
        
      </div>
      
      <HomeBookingSteps />
      <PlanLater />
      <Innovations />
      {/* <Filters /> */}

      {/* <div className="home-cars mx-auto px-4 py-4">
        <div className="row list-cars">
           <h2 className="headline-large-tx">Most popular car rental deals</h2>
              <div className="cards">

                {loading ? (
                   <FullScreenLoader />
                ) : carList.length > 0 ? (
                  carList.map((car, index) => (
                    <CarCard key={index} {...car} />
                  ))
                ) : (
                  <p>No cars found.</p>
                )}
              </div>
        </div>
      </div> */}
    </div>
  );
}
