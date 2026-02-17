import React, { useState } from "react";
import toast from "react-hot-toast";

const carTypes = ["Hatchback", "Sedan", "SUV", "MUV", "Coupe", "Convertible"];
const fuelTypes = ["Gas", "Electric"];

const StepDetails = ({ next, back, update, data }) => {
  const [form, setForm] = useState({
    name: data.name || "",
    carType: data.carType || "",
    fuelType: data.fuelType || "",
    description: data.description || "",
    pricePerMile: data.pricePerMile || "",
    ownerName: data.ownerName || "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // const handleNext = () => {
  //   if (!form.name || !form.carType || !form.fuelType || !form.pricePerMile || !form.ownerName) {
  //     toast.error("Please fill all required fields");
  //     return;
  //   }
  //   update(form);
  //   toast.success("Car details saved successfully!");
  //   next();
  // };

  const handleNext = () => {
    const requiredFields = [
      { name: "name", label: "Car Name" },
      { name: "carType", label: "Car Type" },
      { name: "fuelType", label: "Fuel Type" },
      { name: "pricePerMile", label: "Price per Mile" },
      { name: "ownerName", label: "Owner Name" },
    ];

    const emptyFields = requiredFields
      .filter(field => !form[field.name] || form[field.name].toString().trim() === "")
      .map(field => field.label);

    if (emptyFields.length > 0) {
      toast.error(`Please fill the following field${emptyFields.length > 1 ? "s" : ""}: ${emptyFields.join(", ")}`);
      return;
    }

    update(form);
    toast.success("Car details saved successfully!");
    next();
  };

  return (
    <div className="car-pages-steps car-details">
      <div className="form-container">
        <h2 className="form-title">Car Details</h2>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="name">
              Car Name <span className="required">*</span>
            </label>
            <input
              id="name"
              name="name"
              placeholder="Car Name"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="carType">
              Car Type <span className="required">*</span>
            </label>
            <select
              id="carType"
              name="carType"
              value={form.carType}
              onChange={handleChange}
            >
              <option value="" disabled>Select Car Type</option>
              {carTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="fuelType">
              Fuel Type <span className="required">*</span>
            </label>
            <select
              id="fuelType"
              name="fuelType"
              value={form.fuelType}
              onChange={handleChange}
            >
              <option value="" disabled>Select Fuel Type</option>
              {fuelTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="pricePerMile">
              Price per Mile ($) <span className="required">*</span>
            </label>
            <input
              id="pricePerMile"
              name="pricePerMile"
              type="number"
              min="0"
              placeholder="Price per mile"
              value={form.pricePerMile}
              onChange={handleChange}
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="ownerName">
              Owner Name <span className="required">*</span>
            </label>
            <input
              id="ownerName"
              name="ownerName"
              placeholder="Owner Name"
              value={form.ownerName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows="4"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-footer">
          <button onClick={back} className="bg-blue-500 text-white px-4 py-2 rounded back-btn">Back</button>
          <button onClick={handleNext} className="bg-blue-500 text-white px-4 py-2 rounded nxt-btn">Next</button>
        </div>
      </div>
    </div>
  );
};

export default StepDetails;
