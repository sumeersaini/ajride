import { useRef, useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";
import FullScreenLoader from "../components/FullScreenLoader";
import {
  getDriverDetail,
  updateDriverDetail,
  addDriverDetail,
} from "../api/driver";

// const apiUrl = import.meta.env.VITE_BACKEND_API_URL;

export default function DriverTab() {
  const { user, accessToken } = useAuth();

  const fileFields = [
    { key: "proof_of_work_eligibility", label: "Proof of Work Eligibility" },
    { key: "driver_history", label: "Driver History" },
    { key: "background_check", label: "Background Check" },
    { key: "city_licensing", label: "City Licensing" },
    { key: "driver_licence", label: "Driver Licence" },
  ];

  const [fileNames, setFileNames] = useState({});
  const [previewUrls, setPreviewUrls] = useState({});
  const [selectedFiles, setSelectedFiles] = useState({});
  const [fileStatuses, setFileStatuses] = useState({});

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    licenseClass: "",
    licenseNumber: "",
  });
  const [existingData, setExistingData] = useState(null);

  const fetchDriverDetails = async () => {
    if (!user || !accessToken) return;

    try {
      // const res = await axios.post(
      //   `${apiUrl}/api/merchant/get_driver_detail`,
      //   { uuid: user.id },
      //   {
      //     headers: {
      //       Authorization: `Bearer ${accessToken}`,
      //     },
      //   }
      // );

      // const data = res.data?.data;

      const res = await getDriverDetail(user.id, accessToken);
      const data = res.data?.data;
      // setLoading(false);
      if (data && data.id) {
        setExistingData(data);
        setFormData({
          licenseClass: data.license_class || "",
          licenseNumber: data.license_number || "",
        });

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
      toast.error("Failed to fetch driver details");
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriverDetails();
  }, [user, accessToken]);

  const handleFileChange = (index, e) => {
    if (fileStatuses[index] === 1) {
      toast.error("This document is locked and cannot be changed.");
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

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!user) {
      toast.error("User not authenticated");
      return;
    }

    const uid = user.id;
    const uploadedPaths = {};

    try {
      for (let index = 0; index < fileFields.length; index++) {
        const fieldKey = fileFields[index].key;
        const file = selectedFiles[index];

        if (fileStatuses[index] === 1) {
          if (existingData && existingData[fieldKey]) {
            uploadedPaths[fieldKey] = existingData[fieldKey];
          }
          continue;
        }

        if (!file) {
          if (existingData && existingData[fieldKey]) {
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

      toast.success("Files uploaded successfully!");

      const payload = {
        license_class: formData.licenseClass,
        license_number: formData.licenseNumber,
        ...uploadedPaths,
      };

      let response;
      if (existingData && existingData.id) {
        payload.id = existingData.id;
        // response = await axios.post(
        //   `${apiUrl}/api/merchant/update_driver_details`,
        //   payload,
        //   {
        //     headers: {
        //       Authorization: `Bearer ${accessToken}`,
        //     },
        //   }
        // );

        response = await updateDriverDetail(payload, accessToken);
        toast.success("Driver info updated!");
      } else {
        // response = await axios.post(
        //   `${apiUrl}/api/merchant/add_driver_details`,
        //   payload,
        //   {
        //     headers: {
        //       Authorization: `Bearer ${accessToken}`,
        //     },
        //   }
        // );
        response = await addDriverDetail(payload, accessToken);

        toast.success("Driver info submitted!");
      }

      console.log("Backend response:", response.data);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Upload or submission failed.");
    } finally {
      fetchDriverDetails();
      setLoading(false);
    }
  };

  return (
    <div className="tab-section">
      {loading && <FullScreenLoader />}

      <h2 className="tab-title">Driver Documents</h2>
      <form onSubmit={handleSubmit}>
        <label>License Class</label>
        <input
          type="text"
          name="licenseClass"
          placeholder="e.g. G, G2"
          className="onboarding-input"
          value={formData.licenseClass}
          onChange={handleInputChange}
        />

        <label>License Number</label>
        <input
          type="text"
          name="licenseNumber"
          placeholder="Enter license number"
          className="onboarding-input"
          value={formData.licenseNumber}
          onChange={handleInputChange}
        />

        <div className="file-upload-grid">
          {fileFields.map(({ label }, index) => {
            const inputId = `file-input-${index}`;
            const isLocked = fileStatuses[index] === 1;

            const status = fileStatuses[index];
            const statusMap = {
              0: { label: "Pending", color: "#FFA500" },
              1: { label: "Approved", color: "#4CAF50" },
              2: { label: "Rejected", color: "#F44336" },
            };

            return (
              <div key={label} className="file-box-container">
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

                {/* Status label */}
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

        <div className="submit-wrapper">
          <button type="submit" className="onboarding-submit-button driver-btn">
            {existingData ? "Update Driver Info" : "Submit Driver Info"}
          </button>
        </div>
      </form>
    </div>
  );
}
