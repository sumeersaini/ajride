import React from "react";
import "../styles/HomeBookingSteps.css";

const HomeBookingSteps = () => {
  const steps = [
    {
      id: 1,
      title: "Provide your travel information",
      description:
        "Enter your pickup and destination locations to view trip prices.",
      image: "/images/travelinfo.png", // Replace with your local image path
    },
    {
      id: 2,
      title: "Complete your payment with ease",
      description:
        "Set up your payment method, then pick a ride that suits you nearby.",
      image: "/images/paynew.png",
    },
    {
      id: 3,
      title: "Your driver is on the way",
      description:
        "AJride will connect you with a nearby driver and provide real-time updates on your mobile device or computer.",
       image: "/images/ridegetnew.png",
    },
  ];

  return (
    <div className="booking-container">
      <h2 className="booking-title">Easily book your ride from your phone or computer.</h2>
      <div className="booking-grid">
        {steps.map((step) => (
          <div key={step.id} className="booking-step">
            <img src={step.image} alt={step.title} className="step-image" />
            <h3 className="step-title">
              {step.id}. {step.title}
            </h3>
            <p className="step-description">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeBookingSteps;
