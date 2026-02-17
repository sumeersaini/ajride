import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import axios from "axios";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

const carTypes = ["Hatchback", "Sedan", "SUV", "MUV", "Coupe", "Convertible"];
const fuelTypes = ["Gas", "Electric"];

const apiUrl = import.meta.env.VITE_BACKEND_API_URL;

export default function EditCar() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    car_name: "",
    car_type: "",
    car_engine: "",
    descriptions: "",
    price_per_mile: "",
    owner_name: "",
    location: "",
  });

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [removedImages, setRemovedImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submit, setSubmit] = useState(false);

  useEffect(() => {
    async function fetchCar() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session || !session.user) {
          toast.error("User session not found");
          return;
        }

        const uuid = session.user.id;
        const res = await axios.post(
          `${apiUrl}/api/merchant/get_car_by_id`,
          { uuid, id: parseInt(id) }
        );

        const car = res.data?.data;
        if (car) {
          setForm({
            car_name: car.car_name || "",
            car_type: car.car_type || "",
            car_engine: car.car_engine || "",
            descriptions: car.descriptions || "",
            price_per_mile: car.price_per_mile || "",
            owner_name: car.owner_name || "",
            location: car.location || "",
          });

          const imagesArr =
            car.images && car.images.trim() !== ""
              ? car.images.split(",").map((url) => url.trim())
              : [];
          setExistingImages(imagesArr);
        }
      } catch (err) {
        toast.error("Failed to fetch car details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchCar();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNewImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages((prev) => [...prev, ...files]);
  };

  const handleRemoveExistingImage = (url) => {
    setExistingImages((prev) => prev.filter((img) => img !== url));
    setRemovedImages((prev) => [...prev, url]);
  };

  const handleRemoveNewImage = (file) => {
    setNewImages((prev) => prev.filter((f) => f !== file));
  };

  function getFileNameFromUrl(url) {
    try {
      const parts = url.split("/storage/v1/object/public/ridezy/");
      return parts.length === 2 ? parts[1] : null;
    } catch {
      return null;
    }
  }

  const handleSubmit = async () => {
    const required = [
      "car_name",
      "car_type",
      "car_engine",
      "price_per_mile",
      "owner_name",
      "location",
    ];
    const missing = required.filter(
      (field) => !form[field] || form[field].toString().trim() === ""
    );
    if (missing.length) {
      toast.error(`Please fill: ${missing.join(", ")}`);
      return;
    }

    setSubmit(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session || !session.user) {
        toast.error("User session not found");
        setSubmit(false);
        return;
      }

      const uuid = session.user.id;

      // Delete removed images
      for (const url of removedImages) {
        const filePath = getFileNameFromUrl(url);
        if (filePath) {
          const { error } = await supabase.storage
            .from("ridezy")
            .remove([filePath]);
          if (error) {
            console.warn("Failed to delete image:", filePath, error.message);
          }
        }
      }

      // Upload new images
      const uploadedImageUrls = [];
      for (const file of newImages) {
        const uniqueName = `${uuidv4()}-${file.name}`;
        const fileName = `cars/${uniqueName}`;

        const { error: uploadError } = await supabase.storage
          .from("ridezy")
          .upload(fileName, file, { cacheControl: "3600", upsert: false });

        if (uploadError) {
          toast.error(`Failed to upload image: ${file.name}`);
          setSubmit(false);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from("ridezy")
          .getPublicUrl(fileName);

        uploadedImageUrls.push(publicUrlData.publicUrl);
      }

      const allImages = [...existingImages, ...uploadedImageUrls];
      const imagesString = allImages.join(",");

      await axios.post(
        `${apiUrl}/api/merchant/edit_car_by_id`,
        {
          uuid,
          id: parseInt(id),
          car_name: form.car_name,
          car_type: form.car_type,
          car_engine: form.car_engine,
          descriptions: form.descriptions,
          price_per_mile: parseFloat(form.price_per_mile),
          owner_name: form.owner_name,
          location: form.location,
          images: imagesString,
        }
      );

      toast.success("Car updated successfully!");
      navigate(`/car/${id}`);
    } catch (err) {
      toast.error("Failed to update car");
      console.error(err);
    } finally {
      setSubmit(false);
    }
  };

  if (loading)
    return (
      <div className="loading-cr">
        <img src="/loading-cr.svg" className="loading-cls" />
      </div>
    );

  return (
    <div className="edit-car-pages col-md-8">
      <div className="edit-form-container">
        {submit && (
          <div className="loading-cr">
            <img src="/loading-cr.svg" className="loading-cls" />
          </div>
        )}

        <h2 className="form-title">Edit Car Details</h2>

        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div className="form-group full-width">
            <label className="block mb-2 font-semibold">Existing Images</label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {existingImages.map((url, idx) => (
                <div key={idx} style={{ position: "relative" }}>
                  <img
                    src={url}
                    alt={`Car ${idx + 1}`}
                    style={{
                      width: 100,
                      height: 100,
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                  />
                  <button
                    onClick={() => handleRemoveExistingImage(url)}
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      background: "red",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: 20,
                      height: 20,
                      cursor: "pointer",
                    }}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Image Previews */}
        {newImages.length > 0 && (
          <div className="form-group full-width">
            <label className="block mb-2 font-semibold">New Images to Upload</label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {newImages.map((file, idx) => {
                const url = URL.createObjectURL(file);
                return (
                  <div key={idx} style={{ position: "relative" }}>
                    <img
                      src={url}
                      alt={`New Upload ${idx + 1}`}
                      style={{
                        width: 100,
                        height: 100,
                        objectFit: "cover",
                        borderRadius: 8,
                      }}
                    />
                    <button
                      onClick={() => handleRemoveNewImage(file)}
                      style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        background: "red",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: 20,
                        height: 20,
                        cursor: "pointer",
                      }}
                    >
                      &times;
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Upload Box */}
        <div className="form-group full-width">
          <label className="block mb-2 font-semibold">Upload New Images</label>
          <label
            htmlFor="newImages"
            style={{
              width: 100,
              height: 100,
              border: "2px dashed #999",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#555",
              fontWeight: "bold",
            }}
          >
            Upload
          </label>
          <input
            type="file"
            id="newImages"
            multiple
            accept="image/*"
            onChange={handleNewImagesChange}
            style={{ display: "none" }}
          />
        </div>

        {/* Form Fields */}
        <div className="form-group">
          <label>Car Name:</label>
          <input
            type="text"
            name="car_name"
            value={form.car_name}
            onChange={handleChange}
            placeholder="Enter car name"
          />
        </div>

        <div className="form-group">
          <label>Car Type:</label>
          <select name="car_type" value={form.car_type} onChange={handleChange}>
            <option value="">Select Car Type</option>
            {carTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Fuel Type:</label>
          <select name="car_engine" value={form.car_engine} onChange={handleChange}>
            <option value="">Select Fuel Type</option>
            {fuelTypes.map((fuel) => (
              <option key={fuel} value={fuel}>
                {fuel}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Description:</label>
          <textarea
            name="descriptions"
            value={form.descriptions}
            onChange={handleChange}
            placeholder="Car description"
          />
        </div>

        <div className="form-group">
          <label>Price per mile:</label>
          <input
            type="number"
            name="price_per_mile"
            value={form.price_per_mile}
            onChange={handleChange}
            placeholder="Price per mile"
          />
        </div>

        <div className="form-group">
          <label>Owner Name:</label>
          <input
            type="text"
            name="owner_name"
            value={form.owner_name}
            onChange={handleChange}
            placeholder="Owner name"
          />
        </div>

        <div className="form-group">
          <label>Location:</label>
          <input
            type="text"
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Enter location"
          />
        </div>

        <div className="btn-update-group">
          <button
            className="btn btn-update-car"
            onClick={handleSubmit}
            disabled={submit}
          >
            {submit ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
