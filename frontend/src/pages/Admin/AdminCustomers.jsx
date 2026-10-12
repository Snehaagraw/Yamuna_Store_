import { useState, useEffect } from "react";
import api from "../../api/client";
import { getPhoneDisplayInfo } from "../../constants/countries";
import "./AdminOrders.css";

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
      const response = await api.get("/api/auth/customers/", {
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
      await api.delete(`/api/auth/customers/${customerId}/`, {
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
              {customers.map((c) => {
                const phoneInfo = getPhoneDisplayInfo(
                  c.phone,
                  c.country || "India",
                  `Hare Krishna ${c.name}, regards from Yamuna Store Vrindavan.`
                );

                return (
                  <tr key={c.id}>
                    <td>
                      <div className="admin-customer-info">
                        <strong className="order-customer-name">{c.name}</strong>
                        <small className="admin-customer-username">@{c.username}</small>
                      </div>
                    </td>
                    <td>
                      {phoneInfo.isValid ? (
                        <div className="admin-phone-block">
                          <div className="admin-phone-country-line">
                            <span className={`admin-country-code-badge ${phoneInfo.isInternational ? "international" : ""}`}>
                              <span className="badge-flag">{phoneInfo.flag}</span>
                              <span className="badge-dial">{phoneInfo.dialCode}</span>
                              <span className="badge-iso">{phoneInfo.countryCode}</span>
                            </span>
                            <span className="admin-country-name-tag" title={phoneInfo.countryName}>
                              {phoneInfo.countryName}
                            </span>
                          </div>
                          <div className="admin-phone-contact-line">
                            <span className="admin-phone-number">{phoneInfo.subscriberNumber}</span>
                            {phoneInfo.whatsappUrl && (
                              <a
                                href={phoneInfo.whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="admin-wa-btn"
                                title={`WhatsApp ${phoneInfo.dialCode} ${phoneInfo.subscriberNumber}`}
                              >
                                <span>💬</span> WA ↗
                              </a>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="admin-phone-na">Not Provided</span>
                      )}
                    </td>
                    <td>
                      <span className="admin-email-text">{c.email || "N/A"}</span>
                    </td>
                    <td>
                      <div className="admin-location-block">
                        {c.city && c.city !== "N/A" && (
                          <span className="admin-city-text">{c.city}{c.state ? `, ${c.state}` : ""}</span>
                        )}
                        <span className={`admin-country-code-badge ${c.country && c.country.toLowerCase() !== "india" ? "international" : ""}`}>
                          <span className="badge-flag">{phoneInfo.flag}</span>
                          <span className="badge-dial">{c.country || "India"}</span>
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="order-count-badge">{c.order_count}</span>
                    </td>
                    <td>
                      <strong>₹{Number(c.total_spent || 0).toLocaleString("en-IN")}</strong>
                    </td>
                    <td>
                      <span className="order-date">
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
                      </span>
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default AdminCustomers;
