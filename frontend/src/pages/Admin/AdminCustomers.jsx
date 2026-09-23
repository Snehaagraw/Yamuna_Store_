import { useState, useEffect } from "react";
import axios from "axios";

function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const fetchCustomers = async () => {
    const token = localStorage.getItem("admin_access_token");
    if (!token) {
      setError("Admin session expired. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await axios.get("http://127.0.0.1:8000/api/auth/customers/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCustomers(response.data);
    } catch (err) {
      console.error("Error loading customer data:", err);
      setError("Unable to load registered customer accounts. Ensure Django is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDeleteCustomer = async (customerId, customerName) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete customer account "${customerName}"? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    const token = localStorage.getItem("admin_access_token");
    if (!token) return;

    try {
      setDeletingId(customerId);
      await axios.delete(`http://127.0.0.1:8000/api/auth/customers/${customerId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers((prev) => prev.filter((c) => c.id !== customerId));
    } catch (err) {
      console.error("Error deleting customer:", err);
      alert("Failed to delete customer account. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="admin-orders-section">
      <div className="admin-orders-top">
        <div className="admin-orders-heading">
          <span>STORE MANAGEMENT</span>
          <h2>Customer Directory ({customers.length})</h2>
          <p>Devotees and customers registered on Yamuna Store with their order records.</p>
        </div>

        <button
          type="button"
          className="admin-refresh-btn"
          onClick={fetchCustomers}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "↻ Refresh Customers"}
        </button>
      </div>

      {loading && (
        <div className="admin-orders-status-box">
          <p>Loading customer profiles...</p>
        </div>
      )}

      {error && (
        <div className="admin-orders-status-box error">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && customers.length === 0 && (
        <div className="admin-orders-status-box empty">
          <h3>No customer accounts yet</h3>
          <p>When customers sign up and place orders, their profiles will appear here.</p>
        </div>
      )}

      {!loading && !error && customers.length > 0 && (
        <div className="admin-orders-table-wrapper">
          <table className="admin-orders-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Phone / WhatsApp</th>
                <th>Email</th>
                <th>Location</th>
                <th>Orders Placed</th>
                <th>Total Spent</th>
                <th>Last Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.name}</strong>
                    <br />
                    <small style={{ color: "rgba(93,30,52,0.6)" }}>{c.username}</small>
                  </td>
                  <td>
                    {c.phone && c.phone !== "N/A" ? (
                      <a
                        href={`https://wa.me/91${c.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="order-wa-link"
                      >
                        {c.phone} ↗
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td>{c.email || "N/A"}</td>
                  <td>
                    {c.city && c.city !== "N/A" ? `${c.city}${c.state ? `, ${c.state}` : ""}` : "—"}
                  </td>
                  <td>
                    <span className="order-count-badge">{c.order_count}</span>
                  </td>
                  <td>
                    <strong>₹{Number(c.total_spent || 0).toLocaleString("en-IN")}</strong>
                  </td>
                  <td>
                    {c.last_order_date
                      ? new Date(c.last_order_date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : new Date(c.date_joined).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="order-delete-btn"
                      disabled={deletingId === c.id}
                      title={`Delete customer account for ${c.name}`}
                      onClick={() => handleDeleteCustomer(c.id, c.name)}
                    >
                      {deletingId === c.id ? "..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default AdminCustomers;
