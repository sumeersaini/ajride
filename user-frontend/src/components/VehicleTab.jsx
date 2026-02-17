import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";
import FullScreenLoader from "../components/FullScreenLoader";

import {
  fetchVehicleDetails as fetchVehicleApi,
  addVehicleDetails,
  updateVehicleDetails,
} from "../api/vehicle";

export default function VehicleTab() {
  const { user, accessToken } = useAuth();

  const fileFields = [
    { key: "vehicle_registration", label: "Vehicle Registration" },
    { key: "insurance_information", label: "Insurance Information" },
    { key: "safety_inspection", label: "Safety Inspection" },
  ];

  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [fileNames, setFileNames] = useState({});
  const [selectedFiles, setSelectedFiles] = useState({});
  const [previewUrls, setPreviewUrls] = useState({});
  const [fileStatuses, setFileStatuses] = useState({});
  const [existingData, setExistingData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchVehicleDetails = async () => {
    if (!user || !accessToken) return;

    try {
      const res = await fetchVehicleApi(user.id, accessToken);
      const data = res.data?.data;

      if (data && data.id) {
        setExistingData(data);
        setVehicleNumber(data.vehicle_number || "");
        setVehicleType(data.vehicle_type || "");

        const initialFileNames = {};
        const initialPreviews = {};
        const initialStatuses = {};

        for (let index = 0; index < fileFields.length; index++) {
          const field = fileFields[index];
          const path = data[field.key];
          const statusKey = `${field.key}_status`;

          initialStatuses[index] = parseInt(data[statusKey]) || 0;

          if (path) {
            const parts = path.split("/");
            initialFileNames[index] = parts[parts.length - 1];

            const { data: urlData, error } = await supabase.storage
              .from("documents")
              .createSignedUrl(path, 3600);

            if (!error && urlData?.signedUrl) {
              initialPreviews[index] = urlData.signedUrl;
            }
          }
        }

        setFileNames(initialFileNames);
        setPreviewUrls(initialPreviews);
        setFileStatuses(initialStatuses);
      }
    } catch (error) {
      toast.error("Error fetching vehicle details");
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicleDetails();
  }, [user, accessToken]);

  const handleFileChange = (index, e) => {
    if (fileStatuses[index] === 1) {
      toast.error("This document is approved and cannot be changed.");
      return;
    }

    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFileNames((prev) => ({ ...prev, [index]: file.name }));
      setSelectedFiles((prev) => ({ ...prev, [index]: file }));
      setPreviewUrls((prev) => ({ ...prev, [index]: previewUrl }));
      toast.success(`${file.name} selected`);
      e.target.value = null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    setLoading(true);
    const uid = user.id;
    const uploadedPaths = {};

    try {
      for (let index = 0; index < fileFields.length; index++) {
        const fieldKey = fileFields[index].key;
        const file = selectedFiles[index];

        if (fileStatuses[index] === 1) {
          if (existingData?.[fieldKey]) {
            uploadedPaths[fieldKey] = existingData[fieldKey];
          }
          continue;
        }

        if (!file) {
          if (existingData?.[fieldKey]) {
            uploadedPaths[fieldKey] = existingData[fieldKey];
          }
          continue;
        }

        const path = `${uid}/${file.name}`;
        const { error } = await supabase.storage
          .from("documents")
          .upload(path, file, {
            cacheControl: "3600",
            upsert: true,
          });

        if (error) throw error;

        uploadedPaths[fieldKey] = path;
      }

      const payload = {
        vehicle_number: vehicleNumber,
        vehicle_type: vehicleType,
        ...uploadedPaths,
      };

      if (existingData?.id) {
        payload.id = existingData.id;
        await updateVehicleDetails(payload, accessToken);
        toast.success("Vehicle info updated!");
      } else {
        await addVehicleDetails(payload, accessToken);
        toast.success("Vehicle info submitted!");
      }
    } catch (error) {
      console.error("Vehicle submission error:", error);
      toast.error("Submission failed.");
    } finally {
      fetchVehicleDetails();
      setLoading(false);
    }
  };

  const statusMap = {
    0: { label: "Pending", color: "#FFA500" },
    1: { label: "Approved", color: "#4CAF50" },
    2: { label: "Rejected", color: "#F44336" },
  };

  return (
    <div className="tab-section vehicle-section">
      {loading && <FullScreenLoader />}
      <h2 className="tab-title">Vehicle Documents</h2>

      <form onSubmit={handleSubmit}>
        <label>Vehicle Number</label>
        <input
          type="text"
          placeholder="e.g. CWPB486"
          className="onboarding-input"
          value={vehicleNumber}
          onChange={(e) => setVehicleNumber(e.target.value)}
        />

        <label>Vehicle Type</label>
        <select
          className="onboarding-input"
          value={vehicleType}
          onChange={(e) => setVehicleType(e.target.value)}
        >
          <option value="">Select vehicle type</option>
          <option value="hatchbacks">Hatchbacks</option>
          <option value="sedans">Sedans</option>
          <option value="SUVs">SUVs</option>
          <option value="MUVs">MUVs</option>
          <option value="coupes">Coupes</option>
          <option value="convertibles">Convertibles</option>
        </select>

        <div className="file-upload-grid">
          {fileFields.map(({ key, label }, index) => {
            const inputId = `vehicle-file-${index}`;
            const isLocked = fileStatuses[index] === 1;
            const status = fileStatuses[index];

            return (
              <div key={key} className="file-box-container">
                <label className="file-box-label">{label}</label>
                <label
                  htmlFor={inputId}
                  className={`file-box ${isLocked ? "disabled" : ""}`}
                  title={isLocked ? "Approved - cannot be updated" : ""}
                >
                  {previewUrls[index] ? (
                    <img
                      src={previewUrls[index]}
                      alt="Preview"
                      className="file-preview-image"
                    />
                  ) : fileNames[index] ? (
                    <span className="file-name">{fileNames[index]}</span>
                  ) : (
                    <span className="file-placeholder">Click to upload</span>
                  )}
                </label>
                <input
                  type="file"
                  id={inputId}
                  className="file-input-hidden"
                  style={{ display: "none" }}
                  onChange={(e) => handleFileChange(index, e)}
                  disabled={isLocked}
                />
                <div
                  style={{
                    marginTop: "6px",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    color: statusMap[status]?.color || "#000",
                  }}
                >
                  Status: {statusMap[status]?.label || "Documents Required"}
                </div>
              </div>
            );
          })}
        </div>

        <div className="btn-div submit-wrapper">
          <button
            type="submit"
            className="onboarding-submit-button vehicle-btn"
          >
            {existingData ? "Update Vehicle Info" : "Submit Vehicle Info"}
          </button>
        </div>
      </form>
    </div>
  );
}
