import { useState, useEffect } from "react";
import axios from "axios";
import "./AdminOrders.css";

const STATUS_OPTIONS = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleDeleteOrder = async (orderId, orderNumber) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete order ${orderNumber}? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    const token = localStorage.getItem("admin_access_token");
    if (!token) return;

    try {
      setDeletingId(orderId);
      await axios.delete(`http://127.0.0.1:8000/api/orders/${orderId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }
    } catch (err) {
      console.error("Error deleting order:", err);
      alert("Failed to delete order. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const fetchOrders = async () => {
    const token = localStorage.getItem("admin_access_token");
    if (!token) {
      setError("Admin session expired. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await axios.get("http://127.0.0.1:8000/api/orders/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Unable to load orders from backend. Ensure Django is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    const token = localStorage.getItem("admin_access_token");
    if (!token) return;

    try {
      setUpdatingId(orderId);
      await axios.patch(
        `http://127.0.0.1:8000/api/orders/${orderId}/`,
        { order_status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, order_status: newStatus } : o))
      );

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, order_status: newStatus }));
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Unable to update order status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <section className="admin-orders-section">
      <div className="admin-orders-top">
        <div className="admin-orders-heading">
          <span>STORE FULFILLMENT</span>
          <h2>Customer Orders ({orders.length})</h2>
          <p>Track customer purchases, delivery addresses, and update fulfillment states.</p>
        </div>

        <button type="button" className="admin-refresh-btn" onClick={fetchOrders} disabled={loading}>
          {loading ? "Refreshing..." : "↻ Refresh Orders"}
        </button>
      </div>

      {loading && (
        <div className="admin-orders-status-box">
          <p>Loading orders from database...</p>
        </div>
      )}

      {error && (
        <div className="admin-orders-status-box error">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="admin-orders-status-box empty">
          <h3>No orders placed yet</h3>
          <p>When customers complete checkout, their orders will appear here in real time.</p>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="admin-orders-table-wrapper">
          <table className="admin-orders-table">
            <thead>
              <tr>
                <th>Order No.</th>
                <th>Customer</th>
                <th>Phone / WhatsApp</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <strong>{order.order_number}</strong>
                  </td>
                  <td>
                    <span className="order-customer-name">{order.customer_name}</span>
                    <small className="order-customer-city">{order.city}, {order.state}</small>
                  </td>
                  <td>
                    <a
                      href={`https://wa.me/91${order.customer_phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="order-wa-link"
                    >
                      {order.customer_phone} ↗
                    </a>
                  </td>
                  <td>
                    {order.items?.length || 0} {order.items?.length === 1 ? "piece" : "pieces"}
                  </td>
                  <td>
                    <strong>₹{Number(order.total_amount).toLocaleString("en-IN")}</strong>
                    <br />
                    <small className="order-payment-method">{order.payment_method}</small>
                  </td>
                  <td>
                    <select
                      className={`order-status-select status-${order.order_status.toLowerCase()}`}
                      value={order.order_status}
                      disabled={updatingId === order.id}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <span className="order-date">
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </td>
                  <td>
                    <div className="admin-actions-cell">
                      <button
                        type="button"
                        className="order-view-details-btn"
                        onClick={() => setSelectedOrder(order)}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="order-delete-btn"
                        disabled={deletingId === order.id}
                        title="Delete this order"
                        onClick={() => handleDeleteOrder(order.id, order.order_number)}
                      >
                        {deletingId === order.id ? "..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="order-modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="order-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="order-modal-header">
              <div>
                <span>ORDER DETAILS</span>
                <h3>{selectedOrder.order_number}</h3>
              </div>
              <button
                type="button"
                className="order-modal-close"
                onClick={() => setSelectedOrder(null)}
              >
                ✕
              </button>
            </div>

            <div className="order-modal-body">
              <div className="order-modal-grid">
                <div>
                  <h4>Customer Contact</h4>
                  <p>
                    <strong>Name:</strong> {selectedOrder.customer_name}<br />
                    <strong>Phone:</strong> {selectedOrder.customer_phone}<br />
                    <strong>Email:</strong> {selectedOrder.customer_email || "N/A"}
                  </p>
                </div>

                <div>
                  <h4>Shipping Destination</h4>
                  <p>
                    {selectedOrder.shipping_address}<br />
                    {selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pincode}
                  </p>
                  {selectedOrder.order_notes && (
                    <p style={{ marginTop: "6px" }}>
                      <em>Note: {selectedOrder.order_notes}</em>
                    </p>
                  )}
                </div>
              </div>

              <div className="order-modal-items">
                <h4>Items Ordered ({selectedOrder.items?.length || 0})</h4>
                <div className="modal-items-list">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={item.id || idx} className="modal-item-row">
                      <span>{item.quantity}x {item.product_name}</span>
                      <strong>₹{(Number(item.price) * item.quantity).toLocaleString("en-IN")}</strong>
                    </div>
                  ))}
                </div>
                <div className="modal-total-row">
                  <span>Grand Total:</span>
                  <span>₹{Number(selectedOrder.total_amount).toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="order-modal-footer">
                <button
                  type="button"
                  className="modal-delete-order-btn"
                  disabled={deletingId === selectedOrder.id}
                  onClick={() => handleDeleteOrder(selectedOrder.id, selectedOrder.order_number)}
                >
                  {deletingId === selectedOrder.id ? "Deleting Order..." : "🗑 Delete Order"}
                </button>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setSelectedOrder(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminOrders;
