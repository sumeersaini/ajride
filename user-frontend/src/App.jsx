// src/App.jsx
import React, { useEffect, useState, useRef } from "react";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster, toast } from "react-hot-toast";
import RideRequestPopup from "./components/RideRequestPopup";
import { acceptRideApi, rejectRideApi } from "./api/booking";
import {
  saveNotificationToken,
  removeNotificationToken,
} from "./api/notification";
import { useNavigate, BrowserRouter } from "react-router-dom";
import { socket } from "./services/socket";
import { getPlatform, getBrowser } from "./utils/getPlatform";
import { supabase } from "./services/supabaseClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faBellSlash } from "@fortawesome/free-solid-svg-icons";

// ✅ Backend URL
const backendUrl = import.meta.env.VITE_BACKEND_API_URL;

function isIosSafari() {
  const ua = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(ua);
}
function isInStandaloneMode() {
  return window.matchMedia("(display-mode: standalone)").matches;
}

function AppContent() {
  const { user, accessToken } = useAuth();
  const [oneSignalPlayerId, setOneSignalPlayerId] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [rideRequest, setRideRequest] = useState(null);
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  const platform = getPlatform();
  const browser = getBrowser();

  // ✅ Show warning for iOS Safari PWA
  useEffect(() => {
    if (isIosSafari() && !isInStandaloneMode()) {
      toast.error(
        "📱 Please install this app to your Home Screen to enable notifications."
      );
    }
  }, [platform, browser]);

  // ✅ Login token redemption
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const loginToken = params.get("login_token");
    if (loginToken) {
      async function exchangeLoginToken() {
        toast.loading("Logging you in...");
        try {
          const response = await fetch(`${backendUrl}/api/redeem-token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ login_token: loginToken }),
          });
          const data = await response.json();

          if (response.ok && data.data.access_token && data.data.refresh_token) {
            toast.dismiss();
            toast.success("✅ Logged in successfully!");
            await supabase.auth.setSession({
              access_token: data.access_token,
              refresh_token: data.refresh_token,
            });
            navigate(window.location.pathname, { replace: true });
          } else {
            throw new Error(data.message || "Failed to redeem token.");
          }
        } catch (error) {
          toast.dismiss();
          toast.error("❌ Login failed. Please try again.");
          console.error("Token redemption error:", error);
          navigate("/login");
        }
      }
      exchangeLoginToken();
    }
  }, [navigate]);

  // ✅ Handle ride request
  const handleRideRequest = (data) => {
    setRideRequest(data);
  };

  // ✅ Auto-dismiss popup after 20s
  useEffect(() => {
    if (rideRequest) {
      const timeoutId = setTimeout(() => setRideRequest(null), 20000);
      return () => clearTimeout(timeoutId);
    }
  }, [rideRequest]);

  // ✅ OneSignal setup (fixed with startup sync)
  useEffect(() => {
    if (window.OneSignal && user) {
      const oneSignalLogic = async () => {
        try {
          const isSub = await window.OneSignal.User.PushSubscription.optedIn;
          const playerId = window.OneSignal.User.PushSubscription.id;
          setIsSubscribed(isSub);
          setOneSignalPlayerId(playerId || null);

          // 🔄 Ensure token synced on app start (handles server restart)
          if (isSub && playerId && accessToken) {
            const lastSaved = localStorage.getItem("lastSavedPlayerId");
            if (playerId !== lastSaved) {
              await saveNotificationToken(
                playerId,
                platform,
                accessToken,
                browser
              );
              localStorage.setItem("lastSavedPlayerId", playerId);
              console.log("🔄 Token synced on app start (server restart safe)");
            }
          }

          // Subscription change listener
          window.OneSignal.User.PushSubscription.addEventListener(
            "change",
            async (sub) => {
              if (sub.current?.optedIn === true && sub.current?.id) {
                setIsSubscribed(true);
                setOneSignalPlayerId(sub.current.id);
                if (accessToken) {
                  await saveNotificationToken(
                    sub.current?.id,
                    platform,
                    accessToken,
                    browser
                  );
                  localStorage.setItem("lastSavedPlayerId", sub.current?.id);
                  console.log("✅ Player ID saved to backend");
                }
              } else if (sub.current?.optedIn === false) {
                setIsSubscribed(false);
                setOneSignalPlayerId(null);
                localStorage.removeItem("lastSavedPlayerId");
                if (accessToken) {
                  await removeNotificationToken(platform, browser, accessToken);
                  console.log("✅ Player ID removed from backend");
                }
              }
            }
          );

          // Foreground notification handler
          window.OneSignal.Notifications.addEventListener(
            "foregroundWillDisplay",
            (event) => {
              const notificationData =
                event.notification?.additionalData ||
                event.notification?.data ||
                {};
              const ridePayload = notificationData?.payload;
              if (notificationData.type === "ride_request" && ridePayload) {
                handleRideRequest(ridePayload);
              }
              event.notification.display();
            }
          );

          // Click handler
          window.OneSignal.Notifications.addEventListener("click", (event) => {
            const notificationData =
              event.notification?.additionalData ||
              event.notification?.data ||
              {};
            const ridePayload = notificationData?.payload;
            if (notificationData.type === "ride_request" && ridePayload) {
              handleRideRequest(ridePayload);
            }
          });
        } catch (err) {
          console.error("❌ OneSignal logic error:", err);
        }
      };
      oneSignalLogic();
    }
  }, [user, accessToken, platform, browser]);

  // ✅ Toggle notifications
  const toggleNotifications = async () => {
    try {
      if (!isSubscribed) {
        await window.OneSignal.User.PushSubscription.optIn();
        toast.success("✅ Ride notifications enabled");
      } else {
        await window.OneSignal.User.PushSubscription.optOut();
        toast("🚫 Ride notifications disabled");
      }
    } catch (err) {
      console.error("❌ Toggle notifications failed:", err);
      toast.error("Failed to update notification settings");
    }
  };

  // ✅ Accept ride
  const handleAccept = async () => {
    if (!rideRequest?.rideId) return;
    try {
      await acceptRideApi(
        { rideId: rideRequest.rideId, driverId: rideRequest.driverId },
        accessToken
      );
      socket.emit("join_ride", { rideId: rideRequest.rideId });
      localStorage.setItem("activeRideId", rideRequest.rideId);
      toast.success("Ride accepted. Waiting for confirmation...");
      navigateRef.current("/host/ride/current");
    } catch (err) {
      console.error("❌ Accept ride failed", err);
      toast.error("Failed to accept ride");
    } finally {
      setRideRequest(null);
    }
  };

  // ✅ Reject ride
  const handleReject = async () => {
    if (!rideRequest?.rideId) return;
    try {
      await rejectRideApi(
        { rideId: rideRequest.rideId, driverId: rideRequest.driverId },
        accessToken
      );
      toast("Ride rejected");
    } catch (err) {
      console.error("❌ Reject ride failed", err);
      toast.error("Failed to reject ride");
    } finally {
      setRideRequest(null);
    }
  };

  // ✅ Socket listeners
  useEffect(() => {
    socket.on("ride_assigned", (data) => {
      toast.success(`Driver ${data.driver?.name || "assigned"} is on the way!`);
    });
    socket.on("ride_update", (data) => {
      if (data.status === "searching") toast("Searching for another driver...");
      else if (data.status === "no_driver_available")
        toast.error("No driver available");
    });
    return () => {
      socket.off("ride_assigned");
      socket.off("ride_update");
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {user && (
        <div className="custom-bell-div">
          <button
            onClick={toggleNotifications}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-colors duration-300 ${
              isSubscribed ? "enabled-notify" : "disabled-notify"
            }`}
          >
            {isSubscribed ? (
              <FontAwesomeIcon icon={faBell} />
            ) : (
              <FontAwesomeIcon icon={faBellSlash} />
            )}
          </button>
        </div>
      )}

      <AppRoutes />

      {rideRequest && (
        <RideRequestPopup
          ride={rideRequest}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" reverseOrder={false} />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
