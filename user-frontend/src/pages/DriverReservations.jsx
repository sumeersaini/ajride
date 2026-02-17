import React, { useEffect, useState } from "react";
import "../styles/DriverReservations.css";
import { useAuth } from "../context/AuthContext";
import { getRideHistoryDriver } from "../api/driver";

const DriverReservations = () => {
  const { accessToken, user } = useAuth();

  const [rides, setRides] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  const fetchRides = async (pageNumber) => {
    setLoading(true);
    try {
      const response = await getRideHistoryDriver(
        {
          uuid: user?.uuid, // driver uuid
          page: pageNumber,
          limit: 10,
        },
        accessToken
      );

      const data = response.data;
      console.log("API response:", data);

      if (data.data?.rides) {
        setRides(data.data.rides);
        setPagination(data.data.pagination);
        setError(null);
      } else {
        setError(data.message || "Failed to load rides");
      }
    } catch (err) {
      console.error("Fetch rides error:", err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if ( accessToken) {
      fetchRides(page);
    }
  }, [page, accessToken]);

  return (
    <div className="driver-reservations-page">
      <div className="driver-reservations-content">
        <h2>Driver Reservations</h2>

        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && (
          <>
            <table className="rides-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Pickup</th>
                  <th>Destination</th>
                  <th>Fare</th>
                  <th>Driver</th>
                </tr>
              </thead>
              <tbody>
                {rides.length > 0 ? (
                  rides.map((ride) => (
                    <tr key={ride.id}>
                      <td>{ride.id}</td>
                      <td>{new Date(ride.created_at).toLocaleDateString()}</td>
                      <td>{ride.status}</td>
                      <td>{ride.pickup?.name || "N/A"}</td>
                      <td>{ride.destination?.name || "N/A"}</td>
                      <td>{ride.fare ? `₹${ride.fare.toFixed(2)}` : "—"}</td>
                      <td>{ride.driver?.name || "N/A"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7}>No rides found</td>
                  </tr>
                )}
              </tbody>
            </table>

            {pagination && (
              <div className="pagination-controls">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((prev) => prev - 1)}
                >
                  Previous
                </button>
                <span>
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  disabled={page === pagination.totalPages}
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DriverReservations;
