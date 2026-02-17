import React from "react";
import { Link } from "react-router-dom";

function Sidebar({ tabs, activeTab, onTabClick, isOpen }) {
  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      <Link to="/dashboard" className="sidebar-title">
        Admin Panel
      </Link>
      <ul className="sidebar-menu">
        {tabs.map((tab) => (
          <li
            key={tab.name}
            onClick={() => onTabClick(tab)}
            className={`menu-item ${tab.name === activeTab.name ? "active" : ""}`}
          >
            {tab.name}
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default Sidebar;
