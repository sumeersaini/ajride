import React from "react";

const users = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice@example.com",
    role: "Admin",
    status: "Active",
    createdAt: "2023-01-15",
  },
  {
    id: 2,
    name: "Bob Smith",
    email: "bob@example.com",
    role: "User",
    status: "Inactive",
    createdAt: "2023-03-22",
  },
  {
    id: 3,
    name: "Charlie Ray",
    email: "charlie@example.com",
    role: "Driver",
    status: "Pending",
    createdAt: "2023-05-10",
  },
];

function DashboardHome() {
  return (
    <div className="dashboard-home">
      <div className="dashboard-header">
        <h1>Financial Overview</h1>
        <p>Total Revenue <span className="text-green">+8.75%</span></p>
        <h2>$7,200.00</h2>
        <p>Increased 10% from last month</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card purple">
          <h3>Selling Product</h3>
          <p>$7,350.00</p>
          <small>5,150 Sold in month</small>
        </div>
        <div className="stat-card yellow">
          <h3>Followers</h3>
          <p>3,500+</p>
          <small>Added in one month</small>
        </div>
        <div className="stat-card red">
          <h3>Campaign</h3>
          <p>450</p>
          <small>Installed campaign</small>
        </div>
      </div>
      <div className="last-10-bookings">
        <div className="table-wrapper">
         <table className="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <span className={`status-badge ${user.status.toLowerCase()}`}>
                  {user.status}
                </span>
              </td>
              <td>{user.createdAt}</td>
            </tr>
          ))}
        </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

export default DashboardHome;
