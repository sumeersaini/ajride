import React, { useEffect, useState } from "react";
import "../styles/PassengerHistory.css"; // external css
import { useAuth } from "../context/AuthContext";
import { getRideHistory } from "../api/booking";

const PassengerHistory = () => {
  const { accessToken, user } = useAuth();

  const [rides, setRides] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  const fetchRides = async (pageNumber) => {
    setLoading(true);
    try {
      const response = await getRideHistory(
        {
          page: pageNumber,
          limit: 10,
        },
        accessToken
      );

      const data = response.data;

      if (data && data.data) {
        setRides(data.data.rides || []);
        setPagination(data.data.pagination);
      } else {
        setError(data.message || "Failed to load rides");
      }
    } catch (err) {
      console.error("Passenger history error:", err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchRides(page);
    }
  }, [page,accessToken]);

  return (
    <div className="passenger-history-page">
      <div className="passenger-history-content">
        <h2>Passenger Ride History</h2>

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
                      <td data-label="ID">{ride.id}</td>
                      <td data-label="Date">
                        {new Date(ride.created_at).toLocaleDateString()}
                      </td>
                      <td data-label="Status">{ride.status}</td>
                      <td data-label="Pickup">{ride.pickup?.name || "N/A"}</td>
                      <td data-label="Destination">
                        {ride.destination?.name || "N/A"}
                      </td>
                      <td data-label="Fare">
                        {ride.fare ? `₹${ride.fare.toFixed(2)}` : "—"}
                      </td>
                      <td data-label="Driver">{ride.driver?.name || "N/A"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7}>No rides found</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination controls */}
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

export default PassengerHistory;
