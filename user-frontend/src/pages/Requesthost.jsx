import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import toast from "react-hot-toast";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom"; // 👈 import navigation hook

const apiUrl = import.meta.env.VITE_BACKEND_API_URL;

export default function RequestHost() {
  const { user, accessToken, loading, setUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate(); // 👈 initialize navigation

  const handleSendRequest = async () => {
    if (!accessToken || !user) {
      toast.error("You must be logged in to send a host request.");
      return;
    }

    setSubmitting(true);

    try {
      await axios.post(
        `${apiUrl}/api/member/request_host`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Update Supabase user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          merchant: 1,
          client: "host",
        },
      });

      if (updateError) {
        console.error("Metadata update error:", updateError);
        toast.error("Request sent, but user data update failed.");
      } else {
        // Update local auth context
        setUser((prev) => ({
          ...prev,
          user_metadata: {
            ...prev.user_metadata,
            merchant: 1,
            client: "host",
          },
        }));

        toast.success("Host request submitted successfully!");

        // ✅ Redirect to host-onboarding after 1s delay
        setTimeout(() => {
          navigate("/host-onboarding");
        }, 1000);
      }
    } catch (error) {
      console.error("Host request error:", error);
      toast.error("Failed to submit host request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="request-host-page col-md-6">
      <h2>Host Request</h2>
      <p className="title-host">
        Click the button below to send a host request.
      </p>
      <button
        className="send-request-btn"
        onClick={handleSendRequest}
        disabled={submitting}
      >
        {submitting ? "Submitting..." : "Send Host Request"}
      </button>
    </div>
  );
}
