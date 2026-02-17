// src/components/NotificationBell.jsx
import React, { useEffect, useState } from "react";
import OneSignal from "onesignal-cordova-plugin"; // for React, OneSignal is globally available too
import { saveNotificationToken, removeNotificationToken } from "../api/notification";

export default function NotificationBell({ accessToken, platform, browser }) {
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const permission = await OneSignal.Notifications.permission; // browser permission
        const id = OneSignal.User.PushSubscription.id; // OneSignal Player ID
        setIsSubscribed(!!id && permission === "granted");
      } catch (error) {
        console.error("Error checking subscription:", error);
      }
    };

    checkSubscription();

    // listen to changes (auto update state if subscribed/unsubscribed elsewhere)
    OneSignal.User.PushSubscription.addEventListener("change", (sub) => {
      setIsSubscribed(sub.optedIn);
    });

    return () => {
      OneSignal.User.PushSubscription.removeEventListener("change");
    };
  }, []);

  const handleToggle = async () => {
    try {
      if (isSubscribed) {
        // 🔴 Unsubscribe
        await OneSignal.User.PushSubscription.optOut();
        await removeNotificationToken(platform, browser, accessToken);
        console.log("Unsubscribed & removed from backend");
        setIsSubscribed(false);
      } else {
        // 🟢 Subscribe
        await OneSignal.Notifications.requestPermission(); // ask browser
        await OneSignal.User.PushSubscription.optIn();
        const playerId = OneSignal.User.PushSubscription.id;

        if (playerId) {
          await saveNotificationToken(playerId, platform, accessToken, browser);
          console.log("Subscribed & Player ID saved:", playerId);
          setIsSubscribed(true);
        }
      }
    } catch (error) {
      console.error("Error toggling subscription:", error);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="p-2 rounded-lg shadow-md bg-blue-600 text-white hover:bg-blue-700"
    >
      {isSubscribed ? "🔔 Disable Ride Notifications" : "🔕 Enable Ride Notifications"}
    </button>
  );
}
