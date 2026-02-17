// src/pages/AuthCallback.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const backendUrl = "https://api-ajride.delightcoders.com";
// ✅ New: Get the frontend URL from the environment variable
const frontEndUrl = import.meta.env.VITE_FRONTEND_API_URL;

export default function AuthCallback() {
  const navigate = useNavigate();
  const [loginToken, setLoginToken] = useState(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      const urlHash = window.location.hash;
      const hashParams = new URLSearchParams(urlHash.substring(1));
      const access_token = hashParams.get("access_token");
      const refresh_token = hashParams.get("refresh_token");

      if (access_token && refresh_token) {
        toast.loading("Authenticating...");
        try {
          const response = await fetch(`${backendUrl}/api/exchange-session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ access_token, refresh_token }),
          });

          console.log("ex response", response)

          const data = await response.json();
          console.log("ex data", data, "stt", response.ok)

          if (response.ok && data.data.login_token) {
            toast.dismiss();
            toast.success("Login successful! Please click the button below.");
            setLoginToken(data.data.login_token); // Store the token in state
          } else {
            toast.error("Failed to get login token. Please try again.");
            navigate('/login');
          }
        } catch (error) {
          console.error("❌ Session exchange error:", error);
          toast.dismiss();
          toast.error("❌ Login failed. Please try again.");
          navigate('/login');
        }
      } else {
        toast("No tokens found. Redirecting to login page.");
        navigate('/login');
      }
    };
    handleAuthCallback();
  }, [navigate]);

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1>Completing your login...</h1>
      <p>Due to iOS browser restrictions, please do not close this window and tap the button below.</p>
      {loginToken && (
        <div style={{ marginTop: '2rem' }}>
          <p>Click the button below to finish signing in.</p>
          <a
            // ✅ FIX: Use the full, absolute URL to trigger the PWA redirect on iOS
            href={`${frontEndUrl}/?login_token=${loginToken}`}
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              backgroundColor: '#2196f3',
              color: '#fff',
              borderRadius: '5px',
              textDecoration: 'none',
              marginTop: '10px'
            }}
          >
            Finish Login
          </a>
        </div>
      )}
    </div>
  );
}