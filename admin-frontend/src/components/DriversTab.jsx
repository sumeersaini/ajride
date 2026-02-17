import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import FullScreenLoader from "../components/FullScreenLoader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileAlt } from "@fortawesome/free-solid-svg-icons";

const apiUrl = import.meta.env.VITE_BACKEND_API_URL;

function DriversTab() {
  const { accessToken } = useAuth();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/admin/get_driver_list`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page,
          limit: 8,
          search,
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();

      // ✅ Access nested data correctly
      if (result?.data?.data) {
        setDrivers(result.data.data);
        setTotalPages(result.data.pagination?.totalPages || 1);
      } else {
        setDrivers([]);
      }
    } catch (err) {
      console.error("Error loading drivers:", err);
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchDrivers();
    }
  }, [accessToken, page, search]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset to page 1 when searching
  };

  return (
    <div className="users-tab">
      {loading && <FullScreenLoader />}

      <div className="user-controls search box">
        <input
          type="text"
          placeholder="Search by email or phone"
          value={search}
          onChange={handleSearchChange}
        />
      </div>

      {!loading ? (
        <div className="user-tab-table-container">
          <table className="user-table onboarding-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Client</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {drivers.length > 0 ? (
                drivers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.username || "N/A"}</td>
                    <td>{user.email || "N/A"}</td>
                    <td>{user.phone || "N/A"}</td>
                    <td>{user.client || "N/A"}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          user.active ? "active" : "inactive"
                        }`}
                      >
                        {user.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>{user.createdAt?.slice(0, 10) || "-"}</td>
                    <td>
                      <Link to={`/user-documents/${user.id}?tab=Personal`}>
                        <FontAwesomeIcon icon={faFileAlt} />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">No drivers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <p>Loading...</p>
      )}

      <div className="pagination-controls">
        <button onClick={() => setPage(page - 1)} disabled={page <= 1}>
          Prev
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button onClick={() => setPage(page + 1)} disabled={page >= totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}

export default DriversTab;
