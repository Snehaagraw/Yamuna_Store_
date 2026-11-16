import { useState, useEffect } from "react";
import api from "../../api/client";
import { getPhoneDisplayInfo } from "../../constants/countries";
import "./AdminOrders.css";

function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

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
                  <tr
                    key={c.id}
                    className="admin-clickable-customer-row"
                    onClick={() => setSelectedCustomer(c)}
                    title={`Click to view all orders placed by ${c.name}`}
                  >
                    <td>
                      <div className="admin-customer-info">
                        <strong
                          className="order-customer-name"
                          style={{ color: "var(--maroon)", textDecoration: "underline", textUnderlineOffset: "3px" }}
                        >
                          {c.name}
                        </strong>
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
                                onClick={(e) => e.stopPropagation()}
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
                      <button
                        type="button"
                        className="customer-view-orders-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomer(c);
                        }}
                        title={`View orders placed by ${c.name}`}
                      >
                        Orders ({c.order_count}) ↗
                      </button>
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
                      <div className="admin-actions-cell" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="order-view-details-btn"
                          onClick={() => setSelectedCustomer(c)}
                          title={`View ${c.name}'s orders`}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className="order-delete-btn"
                          disabled={deletingId === c.id}
                          title={`Delete customer account for ${c.name}`}
                          onClick={() => handleDeleteCustomer(c.id, c.name)}
                        >
                          {deletingId === c.id ? "..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Customer Orders History Modal */}
      {selectedCustomer && (
        <div className="order-modal-backdrop" onClick={() => setSelectedCustomer(null)}>
          <div className="customer-orders-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="order-modal-header">
              <div>
                <span>CUSTOMER PROFILE &amp; ORDERS</span>
                <h3>{selectedCustomer.name} (@{selectedCustomer.username})</h3>
              </div>
              <button
                type="button"
                className="order-modal-close"
                onClick={() => setSelectedCustomer(null)}
              >
                ✕
              </button>
            </div>

            {/* Customer Summary Bar */}
            <div className="customer-orders-summary-bar">
              <div className="customer-orders-summary-item">
                <span>Email Address</span>
                <strong>{selectedCustomer.email || "N/A"}</strong>
              </div>
              <div className="customer-orders-summary-item">
                <span>Phone / WhatsApp</span>
                <strong>{selectedCustomer.phone || "Not specified"}</strong>
              </div>
              <div className="customer-orders-summary-item">
                <span>Location</span>
                <strong>
                  {selectedCustomer.city && selectedCustomer.city !== "N/A"
                    ? `${selectedCustomer.city}, ${selectedCustomer.state || ""} (${selectedCustomer.country || "India"})`
                    : selectedCustomer.country || "India"}
                </strong>
              </div>
              <div className="customer-orders-summary-item">
                <span>Orders Placed</span>
                <strong>{selectedCustomer.order_count}</strong>
              </div>
              <div className="customer-orders-summary-item">
                <span>Total Spent</span>
                <strong style={{ color: "var(--maroon)" }}>
                  ₹{Number(selectedCustomer.total_spent || 0).toLocaleString("en-IN")}
                </strong>
              </div>
            </div>

            {/* Orders List */}
            <div className="customer-orders-list-body">
              <h4 style={{ fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gold-dark)", margin: "0 0 14px" }}>
                Order History ({selectedCustomer.orders?.length || 0})
              </h4>

              {(!selectedCustomer.orders || selectedCustomer.orders.length === 0) ? (
                <div style={{ textAlign: "center", padding: "30px 10px", color: "#6b7280", fontSize: "13px" }}>
                  No orders placed yet by this customer.
                </div>
              ) : (
                selectedCustomer.orders.map((ord) => (
                  <div key={ord.id} className="customer-order-card-nested">
                    <div className="customer-order-card-nested-header">
                      <div>
                        <strong style={{ color: "var(--maroon)", fontSize: "14px" }}>{ord.order_number}</strong>
                        <span style={{ fontSize: "11px", color: "#6b7280", marginLeft: "10px" }}>
                          {new Date(ord.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <span className={`payment-status-badge ${ord.payment_status === "Paid" ? "paid" : "pending"}`}>
                          {ord.payment_status === "Paid" ? "✓ Paid" : ord.payment_status || "Pending"}
                        </span>
                        <span className={`order-status-badge status-${(ord.order_status || "pending").toLowerCase()}`}>
                          {ord.order_status}
                        </span>
                        <strong style={{ fontSize: "14px", color: "var(--maroon-dark)", marginLeft: "4px" }}>
                          ₹{Number(ord.total_amount).toLocaleString("en-IN")}
                        </strong>
                      </div>
                    </div>

                    <div style={{ fontSize: "11px", color: "#4b5563", marginBottom: "8px" }}>
                      <span><strong>Delivery:</strong> {ord.shipping_carrier || "India Post"} ({ord.city}, {ord.state})</span>
                      {ord.total_weight && <span> · ⚖️ {ord.total_weight}</span>}
                      {ord.transaction_id && <span> · <code>TXN: {ord.transaction_id}</code></span>}
                    </div>

                    <div className="customer-order-card-nested-items">
                      {ord.items?.map((it, idx) => (
                        <div key={it.id || idx} className="customer-order-nested-item-row">
                          {it.product_id ? (
                            <a
                              href={`/product/${it.product_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="View product on store"
                              style={{ display: "block", flexShrink: 0 }}
                            >
                              {it.image_url ? (
                                <img
                                  src={it.image_url}
                                  alt={it.product_name}
                                  style={{ width: "32px", height: "40px", objectFit: "cover", borderRadius: "3px", border: "1px solid #e5e7eb" }}
                                />
                              ) : (
                                <div style={{ width: "32px", height: "40px", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "3px" }}>
                                  👗
                                </div>
                              )}
                            </a>
                          ) : (
                            it.image_url ? (
                              <img
                                src={it.image_url}
                                alt={it.product_name}
                                style={{ width: "32px", height: "40px", objectFit: "cover", borderRadius: "3px", border: "1px solid #e5e7eb" }}
                              />
                            ) : (
                              <div style={{ width: "32px", height: "40px", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "3px" }}>
                                👗
                              </div>
                            )
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            {it.product_id ? (
                              <a
                                href={`/product/${it.product_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ fontWeight: 600, color: "var(--maroon)", textDecoration: "none" }}
                                title="Open product in new tab"
                              >
                                {it.quantity}x {it.product_name} ↗
                              </a>
                            ) : (
                              <span style={{ fontWeight: 600, color: "#111827" }}>
                                {it.quantity}x {it.product_name}
                              </span>
                            )}
                            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "2px" }}>
                              {it.color && (
                                <span style={{ fontSize: "10px", padding: "1px 5px", background: "#fdf7f9", border: "1px solid rgba(114,38,63,0.2)", color: "var(--maroon)", borderRadius: "3px" }}>
                                  Color: {it.color}
                                </span>
                              )}
                              {it.size && (
                                <span style={{ fontSize: "10px", padding: "1px 5px", background: "#f3f4f6", color: "#4b5563", borderRadius: "3px" }}>
                                  Size: {it.size}
                                </span>
                              )}
                            </div>
                          </div>
                          <span style={{ fontWeight: 600, color: "#374151" }}>
                            ₹{(it.price * it.quantity).toLocaleString("en-IN")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="order-modal-footer">
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedCustomer(null)}
              >
                Close Customer Record
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminCustomers;
