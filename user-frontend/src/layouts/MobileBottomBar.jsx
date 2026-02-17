import React, { useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCompass,
  faHeart,
  faPlay,
  faClock,
  faUser,
  faUsersCog,
  faClipboardCheck,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";
import { Link, useLocation } from "react-router-dom";

import "../styles/MobileMenu.css";

const MobileBottomBar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const client = useMemo(() => user?.user_metadata?.client, [user]);
  const merchantStatus = useMemo(
    () => user?.user_metadata?.merchant ?? 0,
    [user]
  );

  return (
    <div className="mobile-bottom-bar">
      {/* Explore */}
      <Link to="/" className={location.pathname === "/" ? "active" : ""}>
        <div className="bottom-item">
          <FontAwesomeIcon icon={faCompass} />
          <span>Explore</span>
        </div>
      </Link>

      {/* Wishlist */}

      {client === "user" && (
        <>
        <Link
          to="/live-ride"
          className={location.pathname === "/live-ride" ? "active" : ""}
        >
          <div className="bottom-item">
            <FontAwesomeIcon icon={faPlay} />
            <span>Live Ride</span>
          </div>
        </Link>
         <Link
        to="/live-ride"
        className={location.pathname === "/ride/history" ? "active" : ""}
      >
        <div className="bottom-item">
          <FontAwesomeIcon icon={faClock} />
          <span>History</span>
        </div>
      </Link>
        </>
        
      )}
      {/* Logged in vs not */}
      {user ? (
        <>
          {/* Profile always visible */}
          <Link
            to="/profile"
            className={location.pathname === "/profile" ? "active" : ""}
          >
            <div className="bottom-item">
              <FontAwesomeIcon icon={faUser} />
              <span>Profile</span>
            </div>
          </Link>

          {/* Host-specific options */}
          {client === "host" && merchantStatus === 1 && (
            <Link
              to="/host-onboarding"
              className={location.pathname === "/host-onboarding" ? "active" : ""}
            >
              <div className="bottom-item">
                <FontAwesomeIcon icon={faClipboardCheck} />
                <span>Onboarding</span>
              </div>
            </Link>
          )}

          {client === "host" && merchantStatus === 2 && (
            <Link
              to="/host"
              className={location.pathname === "/host" ? "active" : ""}
            >
              <div className="bottom-item">
                <FontAwesomeIcon icon={faUsersCog} />
                <span>Dashboard</span>
              </div>
            </Link>
          )}
        </>
      ) : (
        <Link
          to="/login"
          className={location.pathname === "/login" ? "active" : ""}
        >
          <div className="bottom-item">
            <FontAwesomeIcon icon={faUser} />
            <span>Log in</span>
          </div>
        </Link>
      )}
    </div>
  );
};

export default MobileBottomBar;
