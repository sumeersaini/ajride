import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getActiveRideLive } from "../api/booking";
import { useAuth } from "../context/AuthContext";
import '../styles/NoRide.css';

const PassengerRideLive = () => {
    const navigate = useNavigate();
    const { accessToken } = useAuth();

    const [loading, setLoading] = useState(true);
    const [activeRideId, setActiveRideId] = useState(null);

    useEffect(() => {
        const fetchRide = async () => {
            try {
                const response = await getActiveRideLive({}, accessToken);

                if (response?.data?.data) {
                    const rideId = response.data.data.id;
                    setActiveRideId(rideId);

                    // ✅ auto-redirect as soon as ride is active
                    navigate(`/ride-tracking/${rideId}`, { replace: true });
                } else {
                    setActiveRideId(null);
                }
            } catch (err) {
                console.error("Error checking active ride", err);
                setActiveRideId(null);
            } finally {
                setLoading(false);
            }
        };

        fetchRide();
    }, [accessToken, navigate]);

    if (loading) {
        return (
            <div className="ride-tab-btn">Checking for active ride...</div>
        );
    }

    if (!activeRideId) {
        return (
            <div className="no-host-dashboard-content passenger-noride">
                <div className="no-ride-content">
                    <div className="no-ride-icon"></div>
                    <h2>No Active Ride</h2>
                    <p>It looks like you don’t have any rides at the moment.</p>
                </div>
            </div>
        );
    }

    // if we already navigated, nothing needs to render
    return null;
};

export default PassengerRideLive;
