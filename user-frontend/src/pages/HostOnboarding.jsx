import { useAuth } from "../context/AuthContext";
import "../styles/HostOnboarding.css";
import toast from "react-hot-toast";
import axios from "axios";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faCar,
  faListAlt,
  faCalendarCheck,
} from "@fortawesome/free-solid-svg-icons";

// Import components
import PersonalInfoTab from "../components/PersonalInfoTab";
import DriverTab from "../components/DriverTab";
import VehicleTab from "../components/VehicleTab";
import AdditionalTab from "../components/AdditionalTab";
import FullScreenLoader from "../components/FullScreenLoader";
import { getHostDetail, submitOrUpdateHost } from "../api/host";

const TABS = ["Personal", "Driver", "Vehicle", "Additional"];
const apiUrl = import.meta.env.VITE_BACKEND_API_URL;

export default function HostOnboarding() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Personal");
  const [hostId, setHostId] = useState(null);
  const { user, accessToken } = useAuth();

  const [personalInfo, setPersonalInfo] = useState({
    contact_email: user?.email || "",
    contact_phone: "",
    birthdate: "",
    city: "",
  });

  useEffect(() => {
    if (!user?.id || !accessToken) return;

    const fetchHostDetails = async () => {
      try {
        // const res = await axios.post(
        //   `${apiUrl}/api/merchant/get_host_detail`,
        //   { uuid: user.id },
        //   {
        //     headers: {
        //       Authorization: `Bearer ${accessToken}`,
        //     },
        //   }
        // );

        // const data = res.data.data;
        const res = await getHostDetail(user.id, accessToken);
        const data = res.data.data;
        setLoading(false);

        if (data) {
          setPersonalInfo({
            contact_email: data.contact_email ?? user?.email,
            contact_phone: data.contact_phone ?? "",
            birthdate: data.birthdate ?? "",
            city: data.city ?? "",
          });
          setHostId(data.id);
        }
      } catch (err) {
        setLoading(false);
        console.error("Fetch host details error:", err);
        toast.error(err.response?.data?.message || "Error fetching personal details");

      }
    };

    fetchHostDetails();
  }, [user?.id, accessToken]);

  const handleSubmitPersonalInfo = async () => {
    const payload = {
      ...personalInfo,
      ...(hostId ? { id: hostId } : {}),
    };

    try {
      // await axios.post(
      //   `${apiUrl}/api/merchant/${hostId ? "update_host_details" : "add_host_details"}`,
      //   payload,
      //   {
      //     headers: {
      //       Authorization: `Bearer ${accessToken}`,
      //     },
      //   }
      // );

      const updateRes = await submitOrUpdateHost(payload, accessToken, !!hostId);

      toast.success(
        hostId
          ? "Personal details updated successfully!"
          : "Personal details submitted successfully!"
      );
    } catch (err) {
      console.error("Submit Error:", err);
      setLoading(false);
      toast.error(err.response?.data?.message || "Error submitting personal details");
    }
  };

  return (<>
  <div className="onboarding-container">
      <h1 className="onboarding-title">Host Onboarding</h1>
      {loading && <FullScreenLoader />}

      <div className="onboarding-tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`onboarding-tab-button ${activeTab === tab ? "active" : ""}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="onboarding-tab-content">
        {activeTab === "Personal" && (
          <PersonalInfoTab
            personalInfo={personalInfo}
            setPersonalInfo={setPersonalInfo}
            handleSubmit={handleSubmitPersonalInfo}
          />
        )}

        {activeTab === "Driver" && <DriverTab />}
        {activeTab === "Vehicle" && <VehicleTab />}
        {activeTab === "Additional" && <AdditionalTab />}
      </div>

      
    </div>
    {/* Bottom Nav for Mobile */}
      <div className="mobile-bottom-sub-nav">
        {[
          { label: "Personal", icon: faUser },
          { label: "Driver", icon: faCar },
          { label: "Vehicle", icon: faListAlt },
          { label: "Additional", icon: faCalendarCheck },
        ].map(({ label, icon }) => (
          <button
            key={label}
            className={`mobile-sub-nav-item ${activeTab === label ? "active" : ""}`}
            onClick={() => setActiveTab(label)}
          >
            <FontAwesomeIcon icon={icon} />
            <span className="nav-text">{label}</span>
          </button>
        ))}
      </div>
  </>
    
  );
}
