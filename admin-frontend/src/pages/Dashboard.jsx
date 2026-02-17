import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../styles/Dashboard.css";
import UsersTab from "../components/UsersTab";
import DriversTab from "../components/DriversTab";
import DashboardHome from "../components/DashboardHome";
import DriverRequestsTab from "../components/DriverRequestsTab";
import SupportMessagesTab from "../components/SupportMessagesTab";
import EarningsTab from "../components/EarningsTab";
import BookingsTab from "../components/BookingsTab";
import TaxSettings from "../components/TaxSettings";
import PriceSettings from "../components/PriceSettings";

const tabs = [
  { name: "Dashboard", path: "dashboard", component: DashboardHome },
  { name: "Users", path: "users", component: UsersTab },
  { name: "Onboarding Requests", path: "onboarding-requests", component: DriverRequestsTab },
  { name: "Drivers", path: "drivers", component: DriversTab },
  { name: "Support Messages", path: "support-messages", component: SupportMessagesTab },
  { name: "Earning", path: "earning", component: EarningsTab },
  { name: "Bookings", path: "bookings", component: BookingsTab },
  { name: "Tax Settings", path: "tax-settings", component: TaxSettings },
  { name: "Price Settings", path: "price-settings", component: PriceSettings },

];

function Dashboard() {
  const { tab } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeTab = tabs.find((t) => t.path === tab) || tabs[0];
  const ActiveComponent = activeTab.component;

  const handleTabClick = (tabObj) => {
    navigate(`/dashboard/${tabObj.path}`);
    setSidebarOpen(false); // close sidebar on mobile
  };

  return (
    <div className="dashboard-layout">
      {/* Mobile Menu Button */}
      <button className="mobile-menu-button" onClick={() => setSidebarOpen(true)}>
        ☰ Menu
      </button>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && <div className="sidebar-overlay open" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <Sidebar
        tabs={tabs}
        activeTab={activeTab}
        onTabClick={handleTabClick}
        isOpen={sidebarOpen}
      />

      {/* Main Content */}
      <main className="main-content">
        <h3 className="page-title">{activeTab.name}</h3>
        <div className="tab-content">
          <ActiveComponent />
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
