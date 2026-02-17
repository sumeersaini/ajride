import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";
import FullScreenLoader from "../components/FullScreenLoader";
import "../styles/DriverTabDocument.css"; // reuse styles

const apiUrl = import.meta.env.VITE_BACKEND_API_URL;

export default function VehicleTabDocument({ userId, userUuid }) {
  const { user, accessToken } = useAuth();

  const fileFields = [
    { key: "vehicle_registration", label: "Vehicle Registration" },
    { key: "insurance_information", label: "Insurance Information" },
    { key: "safety_inspection", label: "Safety Inspection" },
  ];

  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("");

  const [fileNames, setFileNames] = useState({});
  const [previewUrls, setPreviewUrls] = useState({});
  const [existingData, setExistingData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchVehicleDetails = async () => {
    if (!userUuid || !accessToken) return;

    try {
      const res = await axios.post(
        `${apiUrl}/api/admin/get_vehicle_detail`,
        { userUuid },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = res.data?.data;
      if (data && data.id) {
        setExistingData(data);
        setVehicleNumber(data.vehicle_number || "");
        setVehicleType(data.vehicle_type || "")
        const names = {};
        const previews = {};

        for (let i = 0; i < fileFields.length; i++) {
          const field = fileFields[i];
          const path = data[field.key];

          if (path) {
            const parts = path.split("/");
            names[i] = parts[parts.length - 1];

            const { data: urlData } = await supabase.storage
              .from("documents")
              .createSignedUrl(path, 3600);

            if (urlData?.signedUrl) {
              previews[i] = urlData.signedUrl;
            }
          }
        }

        setFileNames(names);
        setPreviewUrls(previews);
      }
    } catch (error) {
      toast.error("Failed to fetch vehicle details");
      console.error("Vehicle fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicleDetails();
  }, [userId, userUuid, accessToken]);

  const handleApproval = async (fieldKey, action) => {
    if (!existingData?.id || !user || !accessToken) {
      toast.error("Missing authentication or data.");
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

      await axios.post(`${apiUrl}/api/admin/update_vehicle_document_status`, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      toast.success(`${fieldKey.replace(/_/g, " ")} ${action}`);
      await fetchVehicleDetails(); // 🔁 refresh UI
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

      {!loading && (
        <>
          {existingData ? (
            <>
              <div className="driver-fields">
                <p>
                  <strong>Vehicle Number:</strong> {vehicleNumber}
                </p>
                 <p>
                  <strong>Vehicle Type:</strong> {vehicleType}
                </p>
              </div>

              <div className="driver-documents">
                <h3>Uploaded Documents:</h3>
                <ul className="documents-list">
                  {fileFields.map((field, index) => {
                    const statusValue = existingData[`${field.key}_status`];
                    const statusText =
                      statusValue === "1"
                        ? "Approved"
                        : statusValue === "2"
                        ? "Rejected"
                        : "Pending";

                    return existingData[field.key] && previewUrls[index] ? (
                      <li key={field.key} className="document-item">
                        <p>
                          <strong>{field.label}:</strong>
                        </p>
                        <a
                          href={previewUrls[index]}
                          target="_blank"
                          rel="noreferrer"
                        >
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
                              onClick={() =>
                                handleApproval(field.key, "approved")
                              }
                            >
                              Approve
                            </button>
                            <button
                              className="reject-btn"
                              onClick={() =>
                                handleApproval(field.key, "rejected")
                              }
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
        </>
      )}
    </div>
  );
}
