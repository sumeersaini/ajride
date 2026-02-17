import React, { useEffect, useState } from "react";
import "../styles/Users.css";
const apiUrl = import.meta.env.VITE_BACKEND_API_URL;
import { useAuth } from "../context/AuthContext";
import FullScreenLoader from "../components/FullScreenLoader";

function UsersTab() {
  const { accessToken } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/admin/get_list_users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          page,
          limit: 8,
          search,
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const result = await response.json();
      setUsers(result.data?.data || []);
      setTotalPages(result.data?.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Error loading users:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchUsers();
    }
  }, [accessToken, page, search]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1); // reset to first page when searching
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

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="user-tab-table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
               <th>Phone</th>
               <th>Status</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id}>
                
                  <td>{user.username}</td>
                  <td>{user.email || "N/A"}</td>
                  <td>{user.phone || "N/A"}</td>
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
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      )}

      {/* Pagination controls */}
      <div className="pagination-controls">
        <button onClick={() => setPage(page - 1)} disabled={page <= 1}>
          Prev
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default UsersTab;
