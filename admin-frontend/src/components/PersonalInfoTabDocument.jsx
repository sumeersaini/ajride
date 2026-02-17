import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import axios from "axios";
import { useState, useEffect } from "react";
import FullScreenLoader from "../components/FullScreenLoader";
import { supabase } from '../services/supabaseClient';

const apiUrl = import.meta.env.VITE_BACKEND_API_URL;
import '../styles/PersonalInfoTabDocument.css'
export default function PersonalInfoTabDocument({ userId, userUuid }) {
  const [loading, setLoading] = useState(true);
  const [hostData, setHostData] = useState(null);
  const { accessToken } = useAuth();
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    const fetchHostDetails = async () => {
      if (!userUuid || !accessToken) return;

      try {
        const res = await axios.post(
          `${apiUrl}/api/admin/get_hostonboarding_detail`,
          { userUuid },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const data = res.data.data;
        setHostData(data);
      } catch (error) {
        console.error("Failed to fetch host details:", error);
        toast.error("Error fetching host details");
      } finally {
        setLoading(false);
      }
    };

    fetchHostDetails();
  }, [userUuid, accessToken]);

   const handleFinalApprove = async () => {
    if (!userUuid) return;
    setApproving(true);
 
    try {
      const response = await axios.post(
        `${apiUrl}/api/admin/approval_driver`,
        { userUuid },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      toast.success("Driver approved successfully!");
    } catch (err) {
      console.error("Approval failed:", err);
      toast.error("Failed to approve driver.");
    } finally {
      setApproving(false);
    }
  };

  return (
    <div className="tab-section personal-info-tab">
      {loading && <FullScreenLoader />}

      {!loading && hostData === null && (
        <div className="no-data-found">
          <p style={{ color: "gray", marginTop: "1rem" }}>No data found.</p>
        </div>
      )}

      {!loading && hostData && (
        <div className="personal-info">
          <p><strong>Email:</strong> {hostData.contact_email || "N/A"}</p>
          <p><strong>Phone:</strong> {hostData.contact_phone || "N/A"}</p>
          <p><strong>Birthdate:</strong> {hostData.birthdate || "N/A"}</p>
          <p><strong>City:</strong> {hostData.city || "N/A"}</p>
           <p><strong>Joined At:</strong> {new Date(hostData.createdAt).toLocaleDateString()}</p>
           <button
            className="approve-button"
            onClick={handleFinalApprove}
            disabled={approving}
          >
            {approving ? "Approving..." : "Final Approve Driver"}
          </button>
        </div>
      )}
    </div>
  );
}
