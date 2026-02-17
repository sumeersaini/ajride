import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartBar,
  faCalendarCheck,
  faEnvelope,
  faDollarSign,
  faCar,
} from "@fortawesome/free-solid-svg-icons";

import "../styles/HostDashboard.css";

const HostDashboard = () => {
  const menuItems = [
    { label: "Status", path: "/host/status", icon: faChartBar },
    { label: "Messages", path: "/host/messages", icon: faEnvelope },
    { label: "Reservations", path: "/host/reservations", icon: faCalendarCheck },
    { label: "Earnings", path: "/host/earnings", icon: faDollarSign },
    { label: "Live", path: "/host/ride/current", icon: faCar },
  ];

  return (
    <div className="host-dashboard-container">
      <nav className="host-dashboard-nav">
        {menuItems.map(({ label, path, icon }) => (
          <NavLink
            key={label}
            to={path}
            className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
          >
            <FontAwesomeIcon icon={icon} className="nav-icon" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="host-dashboard-content">
        <Outlet />
      </div>
    </div>
  );
};

export default HostDashboard;
