import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";
import FullScreenLoader from "../components/FullScreenLoader";
import "../styles/DriverTabDocument.css";

const apiUrl = import.meta.env.VITE_BACKEND_API_URL;

export default function AdditionalTabDocument({ userId, userUuid }) {
  const { user, accessToken } = useAuth();

  const fileFields = [
    { key: "hst_number", label: "HST Number" },
    { key: "direct_deposit", label: "Direct Deposit" },
  ];

  const [fileNames, setFileNames] = useState({});
  const [previewUrls, setPreviewUrls] = useState({});
  const [existingData, setExistingData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAdditionalDetails = async () => {
    if (!user || !accessToken) return;

    try {
      const res = await axios.post(
        `${apiUrl}/api/admin/get_additional_detail`,
        { userUuid },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = res.data?.data;
      if (data?.id) {
        setExistingData(data);

        const initialFileNames = {};
        const initialPreviews = {};

        for (let i = 0; i < fileFields.length; i++) {
          const { key } = fileFields[i];
          const path = data[key];
          if (path) {
            const parts = path.split("/");
            initialFileNames[i] = parts[parts.length - 1];

            const { data: urlData } = await supabase.storage
              .from("documents")
              .createSignedUrl(path, 3600);

            if (urlData?.signedUrl) {
              initialPreviews[i] = urlData.signedUrl;
            }
          }
        }

        setFileNames(initialFileNames);
        setPreviewUrls(initialPreviews);
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
  }, [userUuid, accessToken]);

  const handleApproval = async (fieldKey, action) => {
    if (!existingData?.id || !user || !accessToken) {
      toast.error("Missing authentication or data.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        uuid: user.id,
        userUuid,
        field: `${fieldKey}_status`,
        status: action === "approved" ? "1" : "2",
      };

      await axios.post(`${apiUrl}/api/admin/update_additional_document_status`, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      toast.success(`${fieldKey.replace(/_/g, " ")} ${action}`);
      await fetchAdditionalDetails(); // Refresh UI
    } catch (error) {
      console.error("Approval error:", error);
      toast.error("Approval failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="driver-info-tab">
      {loading && <FullScreenLoader />}

      {!loading && existingData ? (
        <>
          <div className="driver-documents">
            <h3>Additional Documents:</h3>
            <ul className="documents-list">
              {fileFields.map(({ key, label }, index) => {
                const statusValue = existingData[`${key}_status`];
                const statusText =
                  statusValue === "1"
                    ? "Approved"
                    : statusValue === "2"
                    ? "Rejected"
                    : "Pending";

                return existingData[key] && previewUrls[index] ? (
                  <li key={key} className="document-item">
                    <p><strong>{label}:</strong></p>
                    <a href={previewUrls[index]} target="_blank" rel="noreferrer">
                      <img
                        src={previewUrls[index]}
                        alt={label}
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
                          onClick={() => handleApproval(key, "approved")}
                        >
                          Approve
                        </button>
                        <button
                          className="reject-btn"
                          onClick={() => handleApproval(key, "rejected")}
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
