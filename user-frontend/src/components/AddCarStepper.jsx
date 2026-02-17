import React, { useState } from "react";
import StepLocation from "./StepLocation";
import StepImages from "./StepImages";
import StepDetails from "./StepDetails";
import StepReview from "./StepReview";

const AddCarStepper = () => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    location: "",
    images: [],
    name: "",
    description: "",
    pricePerMile: "",
    ownerName: "",
  });

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const updateForm = (data) => {
    setFormData(prev => ({ ...prev, ...data }));
  };


    const resetForm = () => {
    setFormData({
            location: "",
            images: [],
            name: "",
            description: "",
            pricePerMile: "",
            ownerName: "",
        });
        setStep(0); // reset step to 0 if you want to start over
    };

  const steps = [
    <StepLocation next={handleNext} update={updateForm} data={formData} />,
    <StepImages next={handleNext} back={handleBack} update={updateForm} data={formData} />,
    <StepDetails next={handleNext} back={handleBack} update={updateForm} data={formData}  />,
    <StepReview back={handleBack} data={formData}   resetForm={resetForm} />,
  ];

  return <div className="p-6 max-w-xl mx-auto">{steps[step]}</div>;
};

export default AddCarStepper;
