import React, { useState } from "react";
import { supabase } from "../services/supabaseClient";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
const apiUrl     = import.meta.env.VITE_BACKEND_API_URL;

const StepReview = ({ back, data, resetForm }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Get current user's UUID from Supabase session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session || !session.user) {
        throw new Error("Unable to retrieve user session");
      }

      const uuid = session.user.id;

      // Upload images
      const imageUrls = [];
      for (let file of data.images) {
        const fileName = `cars/${uuidv4()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("ajride")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from("ajride")
          .getPublicUrl(fileName);

        imageUrls.push(publicUrlData.publicUrl);
      }

      // Prepare API payload
      const payload = {
        uuid, // dynamic UUID
        car_type: data.carType,
        car_engine: data.fuelType,
        car_name: data.name,
        images: imageUrls.join(","), // Store full URLs
        descriptions: data.description,
        price_per_mile: parseFloat(data.pricePerMile),
        owner_name: data.ownerName,
        location: data.location
      };

      // Submit to backend
      await axios.post(
        `${apiUrl}/api/merchant/add_car`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      toast.success("Car added successfully!");
      resetForm();
      navigate("/view-cars");
    } catch (err) {
      console.error("Submission failed:", err);
      toast.error("Error uploading car info. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="car-pages-steps">
      <div className="step-review-container" style={{ paddingBottom: "80px" }}>
        <h2 className="text-xl font-bold mb-4">Review & Submit</h2>

        <p>
          <strong>Location:</strong> {data.location}
        </p>
        <p>
          <strong>Car Name:</strong> {data.name}
        </p>
        <p>
          <strong>Car Type:</strong> {data.carType}
        </p>
        <p>
          <strong>Fuel Type:</strong> {data.fuelType}
        </p>
        <p>
          <strong>Description:</strong> {data.description}
        </p>
        <p>
          <strong>Price per mile:</strong> ${data.pricePerMile}
        </p>
        <p>
          <strong>Owner:</strong> {data.ownerName}
        </p>

        <div className="mt-4">
          <strong>Images:</strong>
          <div className="flex flex-wrap gap-4 mt-2 image-grid" >
            {data.images && data.images.length > 0 ? (
              data.images.map((file, idx) => {
                const src =
                  file instanceof File
                    ? URL.createObjectURL(file)
                    : file;
                return (
                  <div
                    key={idx}
                    className="image-wrapper"
                  >
                    <img
                      src={src}
                      alt={`Car image ${idx + 1}`}
                      className="absolute top-0 left-0 w-full h-full object-cover"
                    />
                  </div>
                );
              })
            ) : (
              <p>No images uploaded.</p>
            )}
          </div>
        </div>

        {/* Fixed footer with buttons */}
        <div className="form-footer fixed-footer">
          <button onClick={back} className="btn back-btn">
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn submit-btn"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepReview;
