import React, { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSignOutAlt, faTachometerAlt } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const MobileBottomBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const client = useMemo(() => user?.user_metadata?.role, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/"); // redirect to login or home page
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="mobile-bottom-bar">
      {user && client === "admin" ? (
        <>
          <Link to="/dashboard">
            <div className="bottom-item">
              <FontAwesomeIcon icon={faTachometerAlt} />
              <span>Dashboard</span>
            </div>
          </Link>

          <button className="bottom-item" onClick={handleLogout} style={{ background: "none", border: "none" }}>
            <FontAwesomeIcon icon={faSignOutAlt} />
            <span>Logout</span>
          </button>
        </>
      ) : (
        <Link to="/">
          <div className="bottom-item">
            <FontAwesomeIcon icon={faUser} />
            <span>Admin Login</span>
          </div>
        </Link>
      )}
    </div>
  );
};

export default MobileBottomBar;
