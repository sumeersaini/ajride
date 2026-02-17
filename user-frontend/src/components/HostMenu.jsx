import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartBar, faCalendarCheck, faEnvelope, faDollarSign, faCar } from "@fortawesome/free-solid-svg-icons";
import "../styles/HostDashboard.css";

const HostMenu = () => {
  console.log("menuuuu")
  const location = useLocation();
  const isRidePage = location.pathname.includes("/host/ride");

  console.log(location,"kkkkkk",isRidePage);
 useEffect(() => {
    console.log("Current path:", location.pathname);
  }, [location]);

  const menuItems = [
    { label: "Status", path: "/host/status", icon: faChartBar },
    { label: "Messages", path: "/host/messages", icon: faEnvelope },
    { label: "Reservations", path: "/host/reservations", icon: faCalendarCheck },
    { label: "Live Ride", path: "/host/current", icon: faCar },
    { label: "Earnings", path: "/host/earnings", icon: faDollarSign },
  ];

  const checkActive = (path) => {
    console.log("location.pathname",location.pathname)
    if (path === "/host/current") {
      // Mark active if current ride page OR any ride detail page
      return location.pathname === "/host/current" || location.pathname.startsWith("/host/ride/");
    }
    return location.pathname === path;
  };

  console.log("checkActive",checkActive(path))

  return (
    <nav className="host-dashboard-nav">
      {menuItems.map(({ label, path, icon }) => (
        <NavLink
          key={label}
          to={path}
          className={() => (checkActive(path) ? "nav-item active" : "nav-item")}
          end={false} // important: disable exact matching for custom logic
        >
          <FontAwesomeIcon icon={icon} className="nav-icon" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default HostMenu;
