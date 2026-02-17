import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";
import FullScreenLoader from "../components/FullScreenLoader";
import { getAdditionalDetails, submitAdditionalDetails } from "../api/additionalInfo";

// const apiUrl = import.meta.env.VITE_BACKEND_API_URL;

export default function AdditionalTab() {
  const { user, accessToken } = useAuth();

  const fileFields = [
    { key: "hst_number", label: "HST Number" },
    { key: "direct_deposit", label: "Direct Deposit" },
  ];

  const [fileNames, setFileNames] = useState({});
  const [selectedFiles, setSelectedFiles] = useState({});
  const [previewUrls, setPreviewUrls] = useState({});
  const [fileStatuses, setFileStatuses] = useState({});
  const [existingData, setExistingData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAdditionalDetails = async () => {
    if (!user || !accessToken) return;
    try {
      setLoading(true);
      const data = await getAdditionalDetails(user.id, accessToken);

       if (data && data.id) {
        setExistingData(data);
        const initialFileNames = {};
        const initialPreviews = {};
        const initialStatuses = {};

        for (let i = 0; i < fileFields.length; i++) {
          const { key } = fileFields[i];
          const path = data[key];
          const statusKey = `${key}_status`;
          initialStatuses[i] = parseInt(data[statusKey]) || 0;

          if (path) {
            const parts = path.split("/");
            initialFileNames[i] = parts[parts.length - 1];

            const { data: urlData, error } = await supabase.storage
              .from("documents")
              .createSignedUrl(path, 3600);

            if (!error && urlData?.signedUrl) {
              initialPreviews[i] = urlData.signedUrl;
            }
          }
        }

        setFileNames(initialFileNames);
        setPreviewUrls(initialPreviews);
        setFileStatuses(initialStatuses);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdditionalDetails();
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
    for (let i = 0; i < fileFields.length; i++) {
      const { key } = fileFields[i];
      const file = selectedFiles[i];

      if (fileStatuses[i] === 1) {
        uploadedPaths[key] = existingData?.[key] || "";
        continue;
      }

      if (!file) {
        uploadedPaths[key] = existingData?.[key] || "";
        continue;
      }

      const path = `${uid}/${file.name}`;
      const { error } = await supabase.storage
        .from("documents")
        .upload(path, file, { cacheControl: "3600", upsert: true });

      if (error) throw error;
      uploadedPaths[key] = path;
    }

    const payload = {
      uuid: uid,
      ...uploadedPaths,
      ...(existingData?.id && { id: existingData.id }),
    };

    await submitAdditionalDetails(payload, accessToken);

    toast.success(
      existingData?.id
        ? "Additional info updated successfully!"
        : "Additional info submitted!"
    );

    fetchAdditionalDetails(); // Refresh view
  } catch (err) {
    console.error("Submit error:", err);
    toast.error("Submission failed.");
  } finally {
    setLoading(false);
  }
};

  const statusMap = {
    0: { label: "Pending", color: "#FFA500" },
    1: { label: "Approved", color: "#4CAF50" },
    2: { label: "Rejected", color: "#F44336" },
  };

  return (
    <div className="tab-section">
      {loading && <FullScreenLoader />}
      <h2 className="tab-title">Additional Documents</h2>
      <form onSubmit={handleSubmit}>
        <div className="file-upload-grid">
          {fileFields.map(({ label }, index) => {
            const inputId = `additional-file-${index}`;
            const status = fileStatuses[index];
            const isLocked = status === 1;

            return (
              <div key={label} className="file-box-container">
                <label className="file-box-label">{label}</label>
                <label
                  htmlFor={inputId}
                  className={`file-box ${isLocked ? "disabled" : ""}`}
                  title={isLocked ? "Approved - cannot be changed" : ""}
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
          <button type="submit" className="onboarding-submit-button additional-btn">
            {existingData ? "Update Additional Info" : "Submit Additional Info"}
          </button>
        </div>
      </form>
    </div>
  );
}
