import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";
import FullScreenLoader from "../components/FullScreenLoader";
import "../styles/DriverTabDocument.css";

const apiUrl = import.meta.env.VITE_BACKEND_API_URL;

export default function DriverTabDocument({ userId, userUuid }) {
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
  const [loading, setLoading] = useState(true);
  const [existingData, setExistingData] = useState(null);

  const fetchDriverDetails = async () => {
    if (!userUuid || !accessToken) return;

    try {
      const res = await axios.post(
        `${apiUrl}/api/admin/get_driver_detail`,
        { userUuid },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = res?.data?.data;
      if (data && data.id) {
        setExistingData(data);

        const initialFileNames = {};
        const initialPreviews = {};

        for (let index = 0; index < fileFields.length; index++) {
          const field = fileFields[index];
          const path = data[field.key];

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
  }, [userId, userUuid, accessToken]);

  const handleApproval = async (fieldKey, action) => {
    if (!user || !accessToken || !userUuid) {
      toast.error("Missing data or authentication");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        uuid: user.id,
        userUuid: userUuid,
        field: `${fieldKey}_status`,
        status: action === "approved" ? "1" : "2",
      };

      await axios.post(`${apiUrl}/api/admin/update_driver_document_status`, payload, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      toast.success(`${fieldKey.replace(/_/g, " ")} ${action}`);
      await fetchDriverDetails(); // 🔁 Refresh status after action
    } catch (error) {
      console.error("Approval error:", error);
      toast.error("Approval failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="driver-info-tab">
      {loading && <FullScreenLoader />}

      {!loading && existingData ? (
        <>
          <div className="driver-fields">
            <p>
              <strong>License Class:</strong> {existingData.license_class}
            </p>
            <p>
              <strong>License Number:</strong> {existingData.license_number}
            </p>
          </div>

          <div className="driver-documents">
            <h3>Uploaded Documents:</h3>
            <ul className="documents-list">
              {fileFields.map((field, index) => {
                const statusValue = existingData[`${field.key}_status`];
                const statusText =
                  statusValue === "1" ? "Approved" :
                  statusValue === "2" ? "Rejected" :
                  "Pending";

                return existingData[field.key] && previewUrls[index] ? (
                  <li key={field.key} className="document-item">
                    <p><strong>{field.label}:</strong></p>
                    <a href={previewUrls[index]} target="_blank" rel="noreferrer">
                      <img
                        src={previewUrls[index]}
                        alt={field.label}
                        className="document-preview"
                      />
                    </a>
                    <p className="filename">{fileNames[index]}</p>

                    <p className={`doc-status ${statusText.toLowerCase()}`}>
                      Status: {statusText}
                    </p>

                    {statusValue !== "1" && (
                    <div className="approval-buttons">
                        <button
                        className="approve-btn"
                        onClick={() => handleApproval(field.key, "approved")}
                        >
                        Approve
                        </button>
                        <button
                        className="reject-btn"
                        onClick={() => handleApproval(field.key, "rejected")}
                        >
                        Reject
                        </button>
                    </div>
                    )}
                  </li>
                ) : null;
              })}
            </ul>
          </div>
        </>
      ) : (
        <div className="no-data-found">
          <p style={{ color: "gray", marginTop: "1rem" }}>No data found.</p>
        </div>
      )}
    </div>
  );
}
