  // src/layouts/Header.jsx
  import React, { useState, useEffect, useMemo } from "react";
  import { Link, useLocation, useNavigate } from "react-router-dom";
  import { useAuth } from "../context/AuthContext";
  import { supabase } from "../services/supabaseClient";

  import OneSignal from "react-onesignal";
  import { removeNotificationToken } from "../api/notification"; // your API call
  import { getPlatform,getBrowser } from "../utils/getPlatform";
  const Header = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const locationPage = location.pathname;
    const platform = getPlatform();
    const browser = getBrowser();

    const [isSticky, setIsSticky] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // 🧠 Memoized client role
    const client = useMemo(() => user?.user_metadata?.client, [user]);
    console.log("client",client)
    const merchantStatus = useMemo(() => user?.user_metadata?.merchant ?? 0, [user]);

    console.log(merchantStatus,"merchantStatus")
    // 🪵 Log metadata only when user changes
    // useEffect(() => {
    //   if (user?.user_metadata) {
    //     console.log("User metadata:", user.user_metadata);

    //     switch (merchantStatus) {
    //       case 0:
    //         console.log("User is not a merchant");
    //         break;
    //       case 1:
    //         console.log("✅ User is an approved merchant");
    //         break;
    //       case 2:
    //         console.log("⏳ Merchant request pending");
    //         break;
    //       default:
    //         console.log("Unknown merchant status");
    //     }
    //   }
    // }, [user, merchantStatus]);

    useEffect(() => {
      const handleScroll = () => {
        setIsSticky(window.scrollY > 10);
      };
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
      setDropdownOpen(false); 
    }, [location.pathname]);
    const toggleDropdown = () => {
      setDropdownOpen((prev) => !prev);
    };

    const handleLogout = async () => {
    try {
      // ✅ Grab session BEFORE logout (to get accessToken)
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      const tokenBeforeLogout = session?.access_token; // save this
      if (!session) {
        console.warn("⚠️ No active session. Redirecting to login.");
        navigate("/login");
        return;
      }

      // ✅ Clear OneSignal Player ID on backend using saved token
      try {
        const subscription = window.OneSignal?.User?.PushSubscription;
        const playerId = subscription?.id;

        if (playerId && tokenBeforeLogout) {
          await removeNotificationToken(platform, browser, tokenBeforeLogout);
          console.log("✅ Player ID cleared from backend");
        } else {
          console.log("⚠️ No Player ID or token available to clear");
        }
      } catch (err) {
        console.error("❌ Error clearing player ID:", err);
      }

      // ✅ Sign out AFTER cleanup
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("❌ Error signing out:", error);
      }

      // ✅ Local cleanup
      localStorage.removeItem("lastSavedPlayerId");

      // ✅ Disconnect socket (optional but recommended)
      try {
        socket.disconnect();
        console.log("🔌 Socket disconnected");
      } catch (err) {
        console.warn("⚠️ Socket disconnect failed:", err);
      }

      // ✅ Redirect
      navigate("/login");
    } catch (error) {
      console.error("❌ Unexpected error signing out:", error);
      navigate("/login");
    }
  };


    return (
      <header className={`header ${isSticky ? "sticky" : ""}`}>
        {/* Logo */}
        <Link to="/">
          <div className="logo">
            <img src="/images/logo-new.png" className="logo1" alt="AJ Ride" />
          </div>
        </Link>

        {/* Navigation Links */}
        {locationPage !== "/login" && locationPage !== "/hostlogin" ? (
          client === "host" ? (
            locationPage === "/" ? null : (
              <div className="nav-links">
                {/* Host nav options if needed */}
              </div>
            )
          ) : (
            <div className="nav-links">
              {/* General user nav options if needed */}
            </div>
          )
        ) : null}

        {/* Profile Area */}
        <div className="profile-area" onClick={toggleDropdown}>
          <div className="profile-btn">
            ☰ <span style={{ fontSize: "20px" }}>👤</span>
          </div>

          {dropdownOpen && (
            <div className="dropdown" id="dropdownMenu">
              {user ? (
                <>
                  {/* Host Dashboard (pending merchant request) */}
                  {client === "host" && merchantStatus === 2 && (
                    <button
                      onClick={() => {
                        navigate("/host");
                        setDropdownOpen(false);
                      }}
                    >
                      Host Dashboard
                    </button>
                  )}

                  <button
                    onClick={() => {
                      navigate("/profile");
                      setDropdownOpen(false);
                    }}
                  >
                    Profile
                  </button>

                  {(client === "user" )&& 

                   <button
                      onClick={() => {
                        navigate("/live-ride");
                        setDropdownOpen(false);
                      }}
                    >
                    Live Ride
                  </button>
                  
                  }

                    {(client === "user" )&& 

                   <button
                      onClick={() => {
                        navigate("/ride/history");
                        setDropdownOpen(false);
                      }}
                    >
                    History
                  </button>
                  
                  }
                  {/* ✅ Become a Host */}
                  {(client === "user" ||
                    (client === "host" && merchantStatus === 0)) && (
                    <button
                      onClick={() => {
                        navigate("/requesthost");
                        setDropdownOpen(false);
                      }}
                    >
                      Become a Host
                    </button>
                  )}

                  {/* Driver Onboarding (only for approved merchants) */}
                  {client === "host" && merchantStatus === 1 && (
                    <button
                      onClick={() => {
                        navigate("/host-onboarding");
                        setDropdownOpen(false);
                      }}
                    >
                      Driver Onboarding
                    </button>
                  )}

                  <button onClick={handleLogout}>Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login">Sign up</Link>
                  <Link to="/login">Log in</Link>
                  <a href="/hostlogin">Become a Host</a>
                </>
              )}
              <a href="#">Host an experience</a>
              <a href="#">Help Centre</a>
            </div>
          )}
        </div>
      </header>
    );
  };

  export default Header;
