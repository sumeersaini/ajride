import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";

import axios from "axios";
import { useState, useEffect, useMemo, useRef } from "react";
import {
  useParams,
  useSearchParams,
  useNavigate,
} from "react-router-dom";

import {
  faUser,
  faCar,
  faListAlt,
  faCalendarCheck,
} from "@fortawesome/free-solid-svg-icons";

import PersonalInfoTabDocument from "../components/PersonalInfoTabDocument";
import DriverTabDocument from "../components/DriverTabDocument";
import VehicleTabDocument from "../components/VehicleTabDocument";
import AdditionalTabDocument from "../components/AdditionalTabDocument";
import FullScreenLoader from "../components/FullScreenLoader";

import "../styles/Dashboard.css"; // <- make sure this includes responsive sidebar styles

const apiUrl = import.meta.env.VITE_BACKEND_API_URL;

export default function UserDocuments() {
  const { accessToken } = useAuth();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const getShortKey = (tabName) => tabName.split(" ")[0];

  const tabs = useMemo(
    () => [
      { name: "Personal Info", icon: faUser },
      { name: "Driver Documents", icon: faCar },
      { name: "Vehicle Documents", icon: faListAlt },
      { name: "Additional Documents", icon: faCalendarCheck },
    ],
    []
  );

  const findTabByShortKey = (key) =>
    tabs.find((tab) => getShortKey(tab.name) === key) || tabs[0];

  const tabParam = searchParams.get("tab") || "Personal";
  const [activeTab, setActiveTab] = useState(findTabByShortKey(tabParam));
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const hasFetched = useRef(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // 🔄 New state for sidebar toggle

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        const res = await axios.post(
          `${apiUrl}/api/admin/get_user_detail_by_id`,
          { id },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setUserData(res.data?.data || {});
      } catch (error) {
        console.error("API error:", error);
        toast.error("Failed to load user details");
      } finally {
        setLoading(false);
      }
    };

    if (id && accessToken && !hasFetched.current) {
      hasFetched.current = true;
      fetchUserDetails();
    }
  }, [id, accessToken]);

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl) {
      const matched = findTabByShortKey(tabFromUrl);
      if (matched.name !== activeTab.name) {
        setActiveTab(matched);
      }
    }
  }, [searchParams]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false); // 👈 close mobile sidebar after click
    navigate(`/user-documents/${id}?tab=${getShortKey(tab.name)}`);
  };

  const ActiveComponent = () => {
    switch (getShortKey(activeTab.name)) {
      case "Personal":
        return (
          <PersonalInfoTabDocument
            userId={id}
            userUuid={userData?.uuid}
          />
        );
      case "Driver":
        return (
          <DriverTabDocument
            userId={id}
            userUuid={userData?.uuid}
          />
        );
      case "Vehicle":
        return (
          <VehicleTabDocument
            userId={id}
            userUuid={userData?.uuid}
          />
        );
      case "Additional":
        return (
          <AdditionalTabDocument
            userId={id}
            userUuid={userData?.uuid}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-layout">
      {loading && <FullScreenLoader />}

      {/* 📱 Mobile Sidebar Toggle */}
      <button
        className="mobile-menu-button"
        onClick={() => setSidebarOpen(true)}
      >
        ☰ Menu
      </button>

      {/* 📱 Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay open"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Component */}
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
