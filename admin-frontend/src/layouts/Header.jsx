// src/layouts/Header.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabaseClient";
import '../styles/Header.css'
const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const locationPage = location.pathname;

  const [isSticky, setIsSticky] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // 🧠 Memoized client role
  const client = useMemo(() => user?.user_metadata?.role, [user]);
    // console.log("meta", user?.user_metadata?.role)

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

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (!data?.session) {
        console.warn("No active session. Redirecting to login.");
        navigate("/");
        return;
      }

      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error);
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Unexpected error signing out:", error);
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
          <div className="nav-links center-admin-title">
            {/* General user nav options if needed */}
            {/* <p>ADMIN</p> */}
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
                
                <button
                  onClick={() => {
                    navigate("/dashboard");
                    setDropdownOpen(false);
                  }}
                >
                  Dashboard
                </button>

                <button onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
               
                <Link to="/">Log in</Link>
                
              </>
            )}
            
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
