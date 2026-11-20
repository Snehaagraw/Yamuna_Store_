import { useState, useEffect } from "react";
import api from "../../api/client";
import { getPhoneDisplayInfo } from "../../constants/countries";
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

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [copiedId, setCopiedId] = useState(null);

  // Refund state
  const [refundOrder, setRefundOrder] = useState(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [refundLoading, setRefundLoading] = useState(false);

  // Shipping tracking modal state
  const [shippingOrder, setShippingOrder] = useState(null);
  const [shippingCarrier, setShippingCarrier] = useState("India Post (Speed Post)");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("https://www.indiapost.gov.in/_layouts/15/dpt.cept.cptc/tracking.aspx");
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippedSuccessOrder, setShippedSuccessOrder] = useState(null);

  // Delivery confirmation modal state
  const [deliveryOrder, setDeliveryOrder] = useState(null);
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [deliveryLoading, setDeliveryLoading] = useState(false);

  const getTrackingWhatsAppUrl = (order) => {
    if (!order) return "";
    const cleanPhone = String(order.customer_phone || "").replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("91") && cleanPhone.length > 10 ? cleanPhone : `91${cleanPhone.replace(/^0+/, "")}`;
    const carrierName = order.shipping_carrier || "India Post (Speed Post)";
    const trackNum = order.tracking_number || "Consignment generated";
    const trackLink = order.tracking_url || "https://www.indiapost.gov.in/_layouts/15/dpt.cept.cptc/tracking.aspx";

    const msg = encodeURIComponent(
      `Hare Krishna ${order.customer_name}! 🙏\n\nYour order *${order.order_number}* from Yamuna Store Vrindavan has been dispatched via *${carrierName}*.\n\n📦 *Consignment / Tracking No:* ${trackNum}\n🔗 *Track Online:* ${trackLink}\n\nWe will ensure safe and auspicious delivery to your address. Feel free to message us if you need any assistance!`
    );
    return `https://wa.me/${formattedPhone}?text=${msg}`;
  };

  const copyToClipboard = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleProcessRefund = async (order, amount, reason) => {
    const token = localStorage.getItem("admin_access_token");
    if (!token) return;

    try {
      setRefundLoading(true);
      const res = await api.post(
        `/api/orders/${order.id}/refund/`,
        { amount, reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id
            ? {
                ...o,
                payment_status: res.data.payment_status || "Refunded",
                order_status: res.data.order_status || "Cancelled",
                order_notes: res.data.order_notes || o.order_notes,
              }
            : o
        )
      );

      if (selectedOrder && selectedOrder.id === order.id) {
        setSelectedOrder((prev) => ({
          ...prev,
          payment_status: res.data.payment_status || "Refunded",
          order_status: res.data.order_status || "Cancelled",
          order_notes: res.data.order_notes || prev.order_notes,
        }));
      }

      alert(res.data.message || "Refund successfully executed!");
      setRefundOrder(null);
    } catch (err) {
      console.error("Refund failed:", err);
      const errMsg = err.response?.data?.error || err.message || "Refund processing failed.";
      alert(`Refund Error: ${errMsg}`);
    } finally {
      setRefundLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId, orderNumber) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete order ${orderNumber}? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    const token = localStorage.getItem("admin_access_token");
    if (!token) return;

    try {
      setDeletingId(orderId);
      await api.delete(`/api/orders/${orderId}/`, {
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
      const response = await api.get("/api/orders/", {
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

    if (newStatus === "Shipped") {
      const order = orders.find((o) => o.id === orderId);
      if (order) {
        setShippingOrder(order);
        setShippingCarrier(order.shipping_carrier || "India Post (Speed Post)");
        setTrackingNumber(order.tracking_number || "");
        setTrackingUrl(
          order.tracking_url ||
            "https://www.indiapost.gov.in/_layouts/15/dpt.cept.cptc/tracking.aspx"
        );
        return;
      }
    }

    if (newStatus === "Delivered") {
      const order = orders.find((o) => o.id === orderId);
      if (order) {
        setDeliveryOrder(order);
        setDeliveryNotes(
          order.delivery_notes ||
            "Delivered via India Post Speed Post - verified by postal tracking."
        );
        return;
      }
    }

    try {
      setUpdatingId(orderId);
      const res = await api.patch(
        `/api/orders/${orderId}/`,
        { order_status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = res.data;
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, ...updated, order_status: newStatus } : o))
      );

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, ...updated, order_status: newStatus }));
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Unable to update order status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveShipping = async (e) => {
    e.preventDefault();
    if (!shippingOrder) return;
    const token = localStorage.getItem("admin_access_token");
    if (!token) return;

    try {
      setShippingLoading(true);
      const cleanTracking = trackingNumber.trim().toUpperCase();
      const cleanUrl =
        trackingUrl.trim() ||
        "https://www.indiapost.gov.in/_layouts/15/dpt.cept.cptc/tracking.aspx";
      const nowIso = new Date().toISOString();

      const res = await api.patch(
        `/api/orders/${shippingOrder.id}/`,
        {
          order_status: "Shipped",
          shipping_carrier: shippingCarrier,
          tracking_number: cleanTracking,
          tracking_url: cleanUrl,
          shipped_at: nowIso,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = res.data;
      setOrders((prev) =>
        prev.map((o) => (o.id === shippingOrder.id ? { ...o, ...updated } : o))
      );

      if (selectedOrder && selectedOrder.id === shippingOrder.id) {
        setSelectedOrder((prev) => ({ ...prev, ...updated }));
      }

      setShippedSuccessOrder({
        ...shippingOrder,
        ...updated,
        tracking_number: cleanTracking,
        tracking_url: cleanUrl,
      });

      setShippingOrder(null);
    } catch (err) {
      console.error("Failed to save shipping info:", err);
      alert("Unable to save shipping details. Please try again.");
    } finally {
      setShippingLoading(false);
    }
  };

  const handleConfirmDelivery = async (e) => {
    e.preventDefault();
    if (!deliveryOrder) return;
    const token = localStorage.getItem("admin_access_token");
    if (!token) return;

    try {
      setDeliveryLoading(true);
      const nowIso = new Date().toISOString();

      const res = await api.patch(
        `/api/orders/${deliveryOrder.id}/`,
        {
          order_status: "Delivered",
          delivered_at: nowIso,
          delivery_notes: deliveryNotes.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = res.data;
      setOrders((prev) =>
        prev.map((o) => (o.id === deliveryOrder.id ? { ...o, ...updated } : o))
      );

      if (selectedOrder && selectedOrder.id === deliveryOrder.id) {
        setSelectedOrder((prev) => ({ ...prev, ...updated }));
      }

      setDeliveryOrder(null);
      alert(`Order ${deliveryOrder.order_number} marked as Delivered! Official delivery timestamp recorded.`);
    } catch (err) {
      console.error("Failed to confirm delivery:", err);
      alert("Unable to update delivery status. Please try again.");
    } finally {
      setDeliveryLoading(false);
    }
  };

  const handlePaymentStatusChange = async (orderId, newPaymentStatus) => {
    const token = localStorage.getItem("admin_access_token");
    if (!token) return;

    try {
      setUpdatingId(orderId);
      await api.patch(
        `/api/orders/${orderId}/`,
        { payment_status: newPaymentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, payment_status: newPaymentStatus } : o))
      );

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, payment_status: newPaymentStatus }));
      }
    } catch (err) {
      console.error("Failed to update payment status:", err);
      alert("Unable to update payment status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  const cleanStr = (s) => (s ? String(s).toLowerCase().replace(/[^a-z0-9]/g, "") : "");
  const searchLower = searchTerm.trim().toLowerCase();
  const searchClean = cleanStr(searchTerm);

  const filteredOrders = orders.filter((order) => {
    if (statusFilter === "PAID" && order.payment_status !== "Paid") return false;
    if (statusFilter === "PENDING" && order.payment_status !== "Pending" && order.payment_status !== "Pending (Wire Verification)") return false;
    if (statusFilter === "REFUNDED" && order.payment_status !== "Refunded") return false;
    if (statusFilter === "CANCELLED" && order.order_status !== "Cancelled") return false;

    if (!searchLower) return true;

    if (order.order_number?.toLowerCase().includes(searchLower)) return true;
    if (order.customer_name?.toLowerCase().includes(searchLower)) return true;
    if (order.customer_email?.toLowerCase().includes(searchLower)) return true;
    if (order.city?.toLowerCase().includes(searchLower)) return true;
    if (order.state?.toLowerCase().includes(searchLower)) return true;
    if (order.transaction_id?.toLowerCase().includes(searchLower)) return true;

    const phoneClean = cleanStr(order.customer_phone);
    if (phoneClean && (phoneClean.includes(searchClean) || searchClean.includes(phoneClean))) return true;

    if (order.items?.some((it) => it.product_name?.toLowerCase().includes(searchLower))) return true;

    return false;
  });

  const counts = {
    all: orders.length,
    paid: orders.filter((o) => o.payment_status === "Paid").length,
    pending: orders.filter((o) => o.payment_status === "Pending" || o.payment_status === "Pending (Wire Verification)").length,
    refunded: orders.filter((o) => o.payment_status === "Refunded").length,
    cancelled: orders.filter((o) => o.order_status === "Cancelled").length,
  };

  return (
    <section className="admin-orders-section">
      <div className="admin-orders-top">
        <div className="admin-orders-heading">
          <span>STORE FULFILLMENT</span>
          <h2>Customer Orders ({orders.length})</h2>
          <p>Track customer purchases, search by name/phone/TXN, and manage refunds.</p>
        </div>

        <button type="button" className="admin-refresh-btn" onClick={fetchOrders} disabled={loading}>
          {loading ? "Refreshing..." : "↻ Refresh Orders"}
        </button>
      </div>

      {/* Real-time Search Bar & Status Filter Tabs */}
      {!loading && !error && orders.length > 0 && (
        <div className="admin-orders-controls">
          <div className="admin-search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by Order #, Customer Name, Phone, Email, City, or TXN ID (pay_...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-search-input"
            />
            {searchTerm && (
              <button
                type="button"
                className="admin-search-clear-btn"
                onClick={() => setSearchTerm("")}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="admin-status-filter-tabs">
            <button
              type="button"
              className={`admin-filter-tab ${statusFilter === "ALL" ? "active" : ""}`}
              onClick={() => setStatusFilter("ALL")}
            >
              All Orders ({counts.all})
            </button>
            <button
              type="button"
              className={`admin-filter-tab paid ${statusFilter === "PAID" ? "active" : ""}`}
              onClick={() => setStatusFilter("PAID")}
            >
              ✓ Paid ({counts.paid})
            </button>
            <button
              type="button"
              className={`admin-filter-tab pending ${statusFilter === "PENDING" ? "active" : ""}`}
              onClick={() => setStatusFilter("PENDING")}
            >
              ⏳ Pending ({counts.pending})
            </button>
            <button
              type="button"
              className={`admin-filter-tab refunded ${statusFilter === "REFUNDED" ? "active" : ""}`}
              onClick={() => setStatusFilter("REFUNDED")}
            >
              ↩ Refunded ({counts.refunded})
            </button>
            <button
              type="button"
              className={`admin-filter-tab cancelled ${statusFilter === "CANCELLED" ? "active" : ""}`}
              onClick={() => setStatusFilter("CANCELLED")}
            >
              ✕ Cancelled ({counts.cancelled})
            </button>
          </div>

          {(searchTerm || statusFilter !== "ALL") && (
            <div className="admin-search-result-count">
              Showing {filteredOrders.length} of {orders.length} orders
            </div>
          )}
        </div>
      )}

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

      {!loading && !error && orders.length > 0 && filteredOrders.length === 0 && (
        <div className="admin-orders-status-box empty" style={{ padding: "30px" }}>
          <h3>No matching orders found</h3>
          <p>No orders match "{searchTerm}" with filter "{statusFilter}".</p>
          <button
            type="button"
            className="admin-filter-tab"
            style={{ marginTop: "12px", cursor: "pointer" }}
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("ALL");
            }}
          >
            Clear Search &amp; Filters
          </button>
        </div>
      )}

      {!loading && !error && filteredOrders.length > 0 && (
        <div className="admin-orders-table-wrapper">
          <table className="admin-orders-table">
            <thead>
              <tr>
                <th>Order No.</th>
                <th>Customer</th>
                <th>Phone / WhatsApp</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Fulfillment</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const phoneInfo = getPhoneDisplayInfo(
                  order.customer_phone,
                  order.country || "India",
                  `Hare Krishna ${order.customer_name}, regards from Yamuna Store Vrindavan regarding order ${order.order_number}.`
                );

                return (
                  <tr key={order.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <strong>{order.order_number}</strong>
                        <button
                          type="button"
                          className="admin-mini-copy-btn"
                          onClick={() => copyToClipboard(order.order_number, `ord-${order.id}`)}
                          title="Copy Order Number"
                        >
                          {copiedId === `ord-${order.id}` ? "✓" : "📋"}
                        </button>
                      </div>
                    </td>
                    <td>
                      <div className="admin-customer-info">
                        <span className="order-customer-name">{order.customer_name}</span>
                        <span className="order-customer-city">
                          {order.city ? `${order.city}, ` : ""}{order.state || ""}
                        </span>
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
                        <span className="admin-phone-na">N/A</span>
                      )}
                    </td>
                    <td>
                      {order.items?.length || 0} {order.items?.length === 1 ? "piece" : "pieces"}
                    </td>
                    <td>
                      <strong>₹{Number(order.total_amount).toLocaleString("en-IN")}</strong>
                      <br />
                      <small className="order-payment-method">
                        {order.shipping_carrier ? `${order.shipping_carrier} · ` : ""}
                        {order.payment_method}
                      </small>
                      {order.total_weight && (
                        <div>
                          <small style={{ color: "#666", fontSize: "9.5px" }}>⚖️ {order.total_weight}</small>
                        </div>
                      )}
                    </td>
                    <td>
                      <select
                        className={`payment-status-badge ${
                          order.payment_status === "Paid"
                            ? "paid"
                            : order.payment_status === "Refunded"
                            ? "refunded"
                            : order.payment_status?.toLowerCase().includes("wire")
                            ? "wire"
                            : "pending"
                        }`}
                        value={order.payment_status || "Pending"}
                        disabled={updatingId === order.id}
                        onChange={(e) => handlePaymentStatusChange(order.id, e.target.value)}
                        style={{ cursor: "pointer", border: "1px solid currentColor", outline: "none" }}
                        title="Click to toggle Payment Status"
                      >
                        <option value="Paid">✓ Paid</option>
                        <option value="Pending">⏳ Pending</option>
                        <option value="Pending (Wire Verification)">🏦 Wire Pending</option>
                        <option value="Refunded">↩ Refunded</option>
                      </select>
                      {order.transaction_id && (
                        <div style={{ marginTop: "3px", display: "flex", alignItems: "center", gap: "4px" }}>
                          <small
                            style={{ fontSize: "10px", color: "#6b7280", fontFamily: "monospace" }}
                            title={order.transaction_id}
                          >
                            TXN: {order.transaction_id.slice(0, 14)}...
                          </small>
                          <button
                            type="button"
                            className="admin-mini-copy-btn"
                            onClick={() => copyToClipboard(order.transaction_id, `txn-${order.id}`)}
                            title="Copy Transaction ID"
                          >
                            {copiedId === `txn-${order.id}` ? "✓" : "📋"}
                          </button>
                        </div>
                      )}
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

                      {order.tracking_number && (
                        <div style={{ marginTop: "5px", display: "flex", flexDirection: "column", gap: "2px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <span style={{ fontSize: "11px", fontWeight: "700", color: "#1e40af", fontFamily: "monospace" }}>
                              📦 {order.tracking_number}
                            </span>
                            <button
                              type="button"
                              className="admin-mini-copy-btn"
                              onClick={() => copyToClipboard(order.tracking_number, `trk-${order.id}`)}
                              title="Copy Consignment Number"
                            >
                              {copiedId === `trk-${order.id}` ? "✓" : "📋"}
                            </button>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <a
                              href={order.tracking_url || "https://www.indiapost.gov.in/_layouts/15/dpt.cept.cptc/tracking.aspx"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="admin-tracking-link-btn"
                              title="Open India Post live consignment tracking"
                            >
                              Track on India Post ↗
                            </a>
                            <a
                              href={getTrackingWhatsAppUrl(order)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="admin-mini-copy-btn"
                              style={{ color: "#16a34a", textDecoration: "none", fontSize: "11px" }}
                              title="Send tracking details to customer on WhatsApp"
                            >
                              💬 WA
                            </a>
                          </div>
                        </div>
                      )}

                      {order.order_status === "Delivered" && order.delivered_at && (
                        <div style={{ marginTop: "4px", fontSize: "10.5px", color: "#059669", fontWeight: "700" }}>
                          ✓ Delivered {new Date(order.delivered_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </div>
                      )}
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
                );
              })}
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
                  {(() => {
                    const modalPhone = getPhoneDisplayInfo(
                      selectedOrder.customer_phone,
                      selectedOrder.country || "India",
                      `Hare Krishna ${selectedOrder.customer_name}, regards from Yamuna Store Vrindavan regarding order ${selectedOrder.order_number}.`
                    );
                    return (
                      <div className="modal-contact-card">
                        <div className="modal-contact-row">
                          <span className="modal-label">Name:</span>
                          <span className="modal-val"><strong>{selectedOrder.customer_name}</strong></span>
                        </div>
                        <div className="modal-contact-row">
                          <span className="modal-label">Email:</span>
                          <span className="modal-val">{selectedOrder.customer_email || "N/A"}</span>
                        </div>
                        <div className="modal-contact-row">
                          <span className="modal-label">Country:</span>
                          <span className="modal-val">
                            <span className={`admin-country-code-badge ${modalPhone.isInternational ? "international" : ""}`}>
                              <span className="badge-flag">{modalPhone.flag}</span>
                              <span className="badge-dial">{selectedOrder.country || modalPhone.countryName}</span>
                              <span className="badge-iso">{modalPhone.countryCode}</span>
                            </span>
                          </span>
                        </div>
                        <div className="modal-contact-row">
                          <span className="modal-label">Phone & Code:</span>
                          <div className="modal-val modal-phone-group">
                            <span className={`admin-country-code-badge ${modalPhone.isInternational ? "international" : ""}`}>
                              <span className="badge-flag">{modalPhone.flag}</span>
                              <span className="badge-dial">{modalPhone.dialCode}</span>
                            </span>
                            <span className="admin-phone-number">{modalPhone.subscriberNumber}</span>
                            {modalPhone.whatsappUrl && (
                              <a
                                href={modalPhone.whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="admin-wa-btn"
                              >
                                <span>💬</span> WA ↗
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div>
                  <h4>Payment &amp; Fulfillment</h4>
                  <p>
                    <strong>Payment Status:</strong>{" "}
                    <span className={`payment-status-badge ${
                      selectedOrder.payment_status === "Paid"
                        ? "paid"
                        : selectedOrder.payment_status === "Refunded"
                        ? "refunded"
                        : selectedOrder.payment_status?.toLowerCase().includes("wire")
                        ? "wire"
                        : "pending"
                    }`}>
                      {selectedOrder.payment_status === "Paid"
                        ? "✓ Paid"
                        : selectedOrder.payment_status === "Refunded"
                        ? "↩ Refunded"
                        : selectedOrder.payment_status || "Pending"}
                    </span>
                    <br />
                    <strong>Payment Method:</strong> {selectedOrder.payment_method || "Online"}<br />
                    {selectedOrder.transaction_id && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginTop: "3px" }}>
                        <strong>Transaction ID:</strong> <code>{selectedOrder.transaction_id}</code>
                        <button
                          type="button"
                          className="admin-mini-copy-btn"
                          onClick={() => copyToClipboard(selectedOrder.transaction_id, `modal-txn-${selectedOrder.id}`)}
                          title="Copy Transaction ID"
                        >
                          {copiedId === `modal-txn-${selectedOrder.id}` ? "✓" : "📋"}
                        </button>
                        {selectedOrder.transaction_id.startsWith("pay_") && (
                          <a
                            href={`https://dashboard.razorpay.com/app/payments/${selectedOrder.transaction_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="modal-razorpay-link-btn"
                            style={{ padding: "2px 8px", fontSize: "10px" }}
                            title="Open in Razorpay Dashboard"
                          >
                            Open in Razorpay ↗
                          </a>
                        )}
                        <br />
                      </span>
                    )}
                    <strong>Fulfillment Status:</strong> {selectedOrder.order_status}
                  </p>

                  <h4 style={{ marginTop: "14px" }}>Shipping &amp; Parcel Details</h4>
                  <p>
                    <strong>Carrier:</strong> {selectedOrder.shipping_carrier || "India Post"}<br />
                    {selectedOrder.total_weight && (
                      <>
                        <strong>Parcel Weight:</strong> {selectedOrder.total_weight}<br />
                      </>
                    )}
                    <strong>Shipping Fee:</strong> ₹{Number(selectedOrder.shipping_fee || 0).toLocaleString("en-IN")}<br />
                    <strong>Destination:</strong> {selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pincode} ({selectedOrder.country || "India"})
                  </p>
                  <p style={{ marginTop: "6px", fontSize: "11px", color: "rgba(93, 30, 52, 0.85)" }}>
                    {selectedOrder.shipping_address}
                  </p>

                  {/* Consignment & Tracking block */}
                  {selectedOrder.tracking_number ? (
                    <div style={{ marginTop: "10px", padding: "10px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "5px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "#1e40af" }}>
                          📦 Consignment / Tracking No:
                        </span>
                        <button
                          type="button"
                          className="admin-mini-copy-btn"
                          onClick={() => copyToClipboard(selectedOrder.tracking_number, `modal-trk-${selectedOrder.id}`)}
                          title="Copy Consignment Number"
                        >
                          {copiedId === `modal-trk-${selectedOrder.id}` ? "✓" : "📋 Copy"}
                        </button>
                      </div>
                      <div style={{ fontFamily: "monospace", fontSize: "13px", fontWeight: "700", color: "#1e3a8a", marginBottom: "6px" }}>
                        {selectedOrder.tracking_number}
                      </div>
                      {selectedOrder.shipped_at && (
                        <div style={{ fontSize: "11px", color: "#4b5563", marginBottom: "6px" }}>
                          Dispatched: {new Date(selectedOrder.shipped_at).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      )}
                      {selectedOrder.order_status === "Delivered" && selectedOrder.delivered_at && (
                        <div style={{ fontSize: "11px", color: "#065f46", fontWeight: "600", marginBottom: "6px" }}>
                          ✓ Delivered: {new Date(selectedOrder.delivered_at).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          {selectedOrder.delivery_notes && <div>Proof: {selectedOrder.delivery_notes}</div>}
                        </div>
                      )}
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "6px" }}>
                        <a
                          href={selectedOrder.tracking_url || "https://www.indiapost.gov.in/_layouts/15/dpt.cept.cptc/tracking.aspx"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="admin-tracking-link-btn"
                        >
                          Track on India Post ↗
                        </a>
                        <a
                          href={getTrackingWhatsAppUrl(selectedOrder)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="admin-mini-copy-btn"
                          style={{ color: "#16a34a", textDecoration: "none", fontSize: "11px", padding: "4px 8px" }}
                        >
                          💬 Send Tracking via WA
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div style={{ marginTop: "10px" }}>
                      <button
                        type="button"
                        className="modal-refund-order-btn"
                        style={{ borderColor: "#0284c7", background: "#f0f9ff", color: "#0369a1" }}
                        onClick={() => {
                          setShippingOrder(selectedOrder);
                          setShippingCarrier(selectedOrder.shipping_carrier || "India Post (Speed Post)");
                          setTrackingNumber("");
                          setTrackingUrl("https://www.indiapost.gov.in/_layouts/15/dpt.cept.cptc/tracking.aspx");
                        }}
                      >
                        📦 Add India Post Tracking
                      </button>
                    </div>
                  )}

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
                    <div
                      key={item.id || idx}
                      className="modal-item-row"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "8px 0",
                        borderBottom: "1px solid #f3f4f6",
                      }}
                    >
                      {item.product ? (
                        <a
                          href={`/product/${item.product}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View product on store"
                          style={{ display: "block", flexShrink: 0 }}
                        >
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.product_name}
                              style={{
                                width: "40px",
                                height: "50px",
                                objectFit: "cover",
                                borderRadius: "4px",
                                border: "1px solid #e5e7eb",
                                flexShrink: 0,
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "40px",
                                height: "50px",
                                background: "#f3f4f6",
                                borderRadius: "4px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "10px",
                                color: "#9ca3af",
                                flexShrink: 0,
                              }}
                            >
                              👗
                            </div>
                          )}
                        </a>
                      ) : (
                        item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.product_name}
                            style={{
                              width: "40px",
                              height: "50px",
                              objectFit: "cover",
                              borderRadius: "4px",
                              border: "1px solid #e5e7eb",
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "40px",
                              height: "50px",
                              background: "#f3f4f6",
                              borderRadius: "4px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "10px",
                              color: "#9ca3af",
                              flexShrink: 0,
                            }}
                          >
                            👗
                          </div>
                        )
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {item.product ? (
                          <a
                            href={`/product/${item.product}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontWeight: "600",
                              color: "var(--maroon)",
                              fontSize: "13.5px",
                              textDecoration: "none",
                              display: "inline-block",
                            }}
                            title="Open product page in new tab"
                          >
                            {item.quantity}x {item.product_name} ↗
                          </a>
                        ) : (
                          <div
                            style={{
                              fontWeight: "600",
                              color: "#111827",
                              fontSize: "13.5px",
                            }}
                          >
                            {item.quantity}x {item.product_name}
                          </div>
                        )}
                        <div
                          style={{
                            display: "flex",
                            gap: "6px",
                            flexWrap: "wrap",
                            marginTop: "3px",
                          }}
                        >
                          {item.color && (
                            <span
                              style={{
                                fontSize: "11px",
                                padding: "1px 7px",
                                background: "#fdf7f9",
                                border: "1px solid rgba(114,38,63,0.2)",
                                color: "var(--maroon)",
                                borderRadius: "4px",
                                fontWeight: "600",
                              }}
                            >
                              Color: {item.color}
                            </span>
                          )}
                          {item.size && (
                            <span
                              style={{
                                fontSize: "11px",
                                padding: "1px 7px",
                                background: "#f3f4f6",
                                border: "1px solid #e5e7eb",
                                color: "#374151",
                                borderRadius: "4px",
                                fontWeight: "600",
                              }}
                            >
                              Size: {item.size}
                            </span>
                          )}
                        </div>
                      </div>
                      <strong style={{ fontSize: "14px", color: "#111827" }}>
                        ₹
                        {(
                          Number(item.price) * item.quantity
                        ).toLocaleString("en-IN")}
                      </strong>
                    </div>
                  ))}
                </div>
                {Number(selectedOrder.shipping_fee) > 0 && (
                  <div className="modal-total-row" style={{ borderTop: "none", paddingTop: "6px", fontSize: "12px", color: "rgba(93, 30, 52, 0.8)" }}>
                    <span>Shipping ({selectedOrder.shipping_carrier || "India Post"}):</span>
                    <span>₹{Number(selectedOrder.shipping_fee).toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="modal-total-row">
                  <span>Grand Total:</span>
                  <span>₹{Number(selectedOrder.total_amount).toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="order-modal-footer">
                {selectedOrder.payment_status !== "Refunded" ? (
                  <button
                    type="button"
                    className="modal-refund-order-btn"
                    onClick={() => {
                      setRefundOrder(selectedOrder);
                      setRefundAmount(selectedOrder.total_amount);
                      setRefundReason("Customer requested return/refund");
                    }}
                    title="Process a full or partial refund for this order"
                  >
                    ↩ Process Refund / Return
                  </button>
                ) : (
                  <span className="payment-status-badge refunded" style={{ padding: "6px 12px", fontSize: "11px" }}>
                    ↩ Refund Processed
                  </span>
                )}
                {selectedOrder.transaction_id && selectedOrder.transaction_id.startsWith("pay_") && (
                  <a
                    href={`https://dashboard.razorpay.com/app/payments/${selectedOrder.transaction_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="modal-razorpay-link-btn"
                    title="Open live payment in Razorpay Dashboard"
                  >
                    Open in Razorpay Dashboard ↗
                  </a>
                )}
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

      {/* Refund Confirmation Modal */}
      {refundOrder && (
        <div className="order-modal-backdrop" onClick={() => !refundLoading && setRefundOrder(null)}>
          <div className="order-modal-card refund-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="order-modal-header" style={{ borderBottom: "1px solid rgba(124, 58, 237, 0.2)" }}>
              <div>
                <span style={{ fontSize: "10px", color: "#6d28d9", fontWeight: 700, letterSpacing: "0.08em" }}>
                  PAYMENT REFUND &amp; CANCELLATION
                </span>
                <h3 style={{ margin: "3px 0 0" }}>Refund Order #{refundOrder.order_number}</h3>
              </div>
              <button
                type="button"
                className="order-modal-close"
                disabled={refundLoading}
                onClick={() => setRefundOrder(null)}
              >
                ✕
              </button>
            </div>

            <div className="order-modal-body">
              <div className="refund-summary-box">
                <div className="refund-summary-row">
                  <span>Customer Name:</span>
                  <strong>{refundOrder.customer_name}</strong>
                </div>
                <div className="refund-summary-row">
                  <span>Phone Number:</span>
                  <span>{refundOrder.customer_phone}</span>
                </div>
                <div className="refund-summary-row">
                  <span>Original Total Paid:</span>
                  <strong>₹{Number(refundOrder.total_amount).toLocaleString("en-IN")}</strong>
                </div>
                <div className="refund-summary-row">
                  <span>Payment Method:</span>
                  <span>{refundOrder.payment_method || "Online"}</span>
                </div>
                {refundOrder.transaction_id && (
                  <div className="refund-summary-row">
                    <span>Transaction ID:</span>
                    <code style={{ fontSize: "11px", background: "#f3f4f6", padding: "1px 6px", borderRadius: "3px" }}>
                      {refundOrder.transaction_id}
                    </code>
                  </div>
                )}
              </div>

              <div className="refund-form-group">
                <label>Refund Amount (₹):</label>
                <input
                  type="number"
                  step="1"
                  max={refundOrder.total_amount}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  disabled={refundLoading}
                  className="refund-input"
                />
                <small>Defaults to ₹{refundOrder.total_amount} for full refund, or adjust for a partial refund.</small>
              </div>

              <div className="refund-form-group">
                <label>Refund Reason / Customer Request:</label>
                <input
                  type="text"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  disabled={refundLoading}
                  placeholder="e.g. Customer cancelled order / Size exchange / Return requested"
                  className="refund-input"
                />
              </div>

              {refundOrder.transaction_id && refundOrder.transaction_id.startsWith("pay_") ? (
                <div className="refund-info-box rzp-info">
                  <strong>⚡ Official Razorpay Auto-Refund:</strong>
                  <p>
                    Clicking below initiates an official Razorpay refund for ₹{refundAmount} straight back to the devotee's original UPI ID or Bank Account. Razorpay notifies the customer via SMS/Email automatically.
                  </p>
                </div>
              ) : (
                <div className="refund-info-box manual-info">
                  <strong>ℹ️ Manual / Wire Transfer Refund:</strong>
                  <p>
                    For international wire transfers or offline payments, transfer the funds directly to the customer's account, then click below to record the order as Refunded.
                  </p>
                </div>
              )}
            </div>

            <div className="order-modal-footer">
              {refundOrder.transaction_id && refundOrder.transaction_id.startsWith("pay_") && (
                <a
                  href={`https://dashboard.razorpay.com/app/payments/${refundOrder.transaction_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="modal-razorpay-link-btn"
                  title="Open live payment in Razorpay Dashboard"
                >
                  Open in Razorpay ↗
                </a>
              )}
              <button
                type="button"
                className="modal-execute-refund-btn"
                disabled={refundLoading || !refundAmount || Number(refundAmount) <= 0}
                onClick={() => handleProcessRefund(refundOrder, refundAmount, refundReason)}
              >
                {refundLoading
                  ? "Processing Refund..."
                  : refundOrder.transaction_id?.startsWith("pay_")
                  ? `⚡ Issue Razorpay Refund (₹${refundAmount})`
                  : `✓ Confirm Manual Refund (₹${refundAmount})`}
              </button>
              <button
                type="button"
                className="modal-close-btn"
                disabled={refundLoading}
                onClick={() => setRefundOrder(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* India Post / Carrier Shipping Tracking Modal */}
      {shippingOrder && (
        <div className="order-modal-backdrop" onClick={() => !shippingLoading && setShippingOrder(null)}>
          <div className="order-modal-card shipping-modal-card" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSaveShipping}>
              <div className="order-modal-header" style={{ borderBottom: "1px solid rgba(2, 132, 199, 0.2)" }}>
                <div>
                  <span style={{ fontSize: "10px", color: "#0284c7", fontWeight: 700, letterSpacing: "0.08em" }}>
                    PARCEL DISPATCH &amp; TRACKING
                  </span>
                  <h3 style={{ margin: "3px 0 0" }}>Ship Order #{shippingOrder.order_number}</h3>
                </div>
                <button
                  type="button"
                  className="order-modal-close"
                  disabled={shippingLoading}
                  onClick={() => setShippingOrder(null)}
                >
                  ✕
                </button>
              </div>

              <div className="order-modal-body">
                <div className="shipping-summary-box">
                  <div className="refund-summary-row">
                    <span>Customer Name:</span>
                    <strong>{shippingOrder.customer_name}</strong>
                  </div>
                  <div className="refund-summary-row">
                    <span>Destination:</span>
                    <span>
                      {shippingOrder.city}, {shippingOrder.state} - {shippingOrder.pincode} ({shippingOrder.country || "India"})
                    </span>
                  </div>
                  <div className="refund-summary-row">
                    <span>Phone:</span>
                    <span>{shippingOrder.customer_phone}</span>
                  </div>
                  {shippingOrder.total_weight && (
                    <div className="refund-summary-row">
                      <span>Total Parcel Weight:</span>
                      <strong>{shippingOrder.total_weight}</strong>
                    </div>
                  )}
                </div>

                <div className="shipping-form-group">
                  <label>Shipping Carrier / Partner:</label>
                  <select
                    className="shipping-input"
                    value={shippingCarrier}
                    onChange={(e) => setShippingCarrier(e.target.value)}
                    disabled={shippingLoading}
                  >
                    <option value="India Post (Speed Post)">India Post (Speed Post)</option>
                    <option value="India Post (Registered Parcel)">India Post (Registered Parcel)</option>
                    <option value="DHL Express (Worldwide)">DHL Express (Worldwide)</option>
                    <option value="Blue Dart Express">Blue Dart Express</option>
                    <option value="DTDC Courier">DTDC Courier</option>
                    <option value="Direct Atelier Delivery">Direct Atelier Delivery</option>
                  </select>
                </div>

                <div className="shipping-form-group">
                  <label>India Post Consignment / Tracking Number *:</label>
                  <input
                    type="text"
                    required
                    className="shipping-input"
                    style={{ fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.05em" }}
                    placeholder="e.g. EM123456789IN / ED987654321IN"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                    disabled={shippingLoading}
                  />
                  <small>
                    Find the 13-character tracking barcode on your India Post booking receipt (starts with 'E' or 'R' and ends with 'IN').
                  </small>
                </div>

                <div className="shipping-form-group">
                  <label>Live Tracking Website URL:</label>
                  <input
                    type="url"
                    className="shipping-input"
                    value={trackingUrl}
                    onChange={(e) => setTrackingUrl(e.target.value)}
                    disabled={shippingLoading}
                  />
                  <small>
                    Default official India Post tracking portal. The customer will see a 1-click button to track their parcel directly.
                  </small>
                </div>

                <div className="shipping-info-banner">
                  <strong>💡 What happens when you confirm:</strong>
                  <div style={{ marginTop: "4px" }}>
                    • Order status updates to <strong>"Shipped"</strong> in real-time.<br />
                    • Customer sees the <strong>India Post Consignment number</strong> and <strong>"Track on India Post"</strong> button in their account.<br />
                    • You get a <strong>1-Click WhatsApp button</strong> to send the tracking link directly to the customer.
                  </div>
                </div>
              </div>

              <div className="order-modal-footer">
                <button
                  type="submit"
                  className="modal-save-shipping-btn"
                  disabled={shippingLoading || !trackingNumber.trim()}
                >
                  {shippingLoading ? "Saving Tracking..." : "✓ Confirm & Mark as Shipped"}
                </button>
                <button
                  type="button"
                  className="modal-close-btn"
                  disabled={shippingLoading}
                  onClick={() => setShippingOrder(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delivery Confirmation Modal */}
      {deliveryOrder && (
        <div className="order-modal-backdrop" onClick={() => !deliveryLoading && setDeliveryOrder(null)}>
          <div className="order-modal-card delivery-modal-card" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleConfirmDelivery}>
              <div className="order-modal-header" style={{ borderBottom: "1px solid rgba(5, 150, 105, 0.2)" }}>
                <div>
                  <span style={{ fontSize: "10px", color: "#059669", fontWeight: 700, letterSpacing: "0.08em" }}>
                    OFFICIAL DELIVERY VERIFICATION
                  </span>
                  <h3 style={{ margin: "3px 0 0" }}>Confirm Delivery: #{deliveryOrder.order_number}</h3>
                </div>
                <button
                  type="button"
                  className="order-modal-close"
                  disabled={deliveryLoading}
                  onClick={() => setDeliveryOrder(null)}
                >
                  ✕
                </button>
              </div>

              <div className="order-modal-body">
                <div className="shipping-summary-box">
                  <div className="refund-summary-row">
                    <span>Customer Name:</span>
                    <strong>{deliveryOrder.customer_name}</strong>
                  </div>
                  <div className="refund-summary-row">
                    <span>Delivered To:</span>
                    <span>{deliveryOrder.city}, {deliveryOrder.state} - {deliveryOrder.pincode}</span>
                  </div>
                  {deliveryOrder.tracking_number && (
                    <div className="refund-summary-row">
                      <span>India Post Consignment:</span>
                      <strong style={{ fontFamily: "monospace" }}>{deliveryOrder.tracking_number}</strong>
                    </div>
                  )}
                  {deliveryOrder.shipped_at && (
                    <div className="refund-summary-row">
                      <span>Dispatched On:</span>
                      <span>{new Date(deliveryOrder.shipped_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                  )}
                </div>

                <div className="shipping-form-group">
                  <label>Proof of Delivery / Delivery Confirmation Notes:</label>
                  <input
                    type="text"
                    className="shipping-input"
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    disabled={deliveryLoading}
                    placeholder="e.g. Delivered via India Post Speed Post - verified by postal tracking."
                  />
                  <small>
                    This permanent note locks the delivery status in the database so no customer can claim the parcel was not delivered.
                  </small>
                </div>

                <div className="shipping-info-banner" style={{ background: "#ecfdf5", borderColor: "#a7f3d0", color: "#065f46" }}>
                  <strong>🔒 Protection Against False Claims:</strong>
                  <p style={{ margin: "4px 0 0" }}>
                    Once confirmed, the order will be locked as <strong>"Delivered"</strong> with an official delivery timestamp ({new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}).
                    The customer's account dashboard will show verified delivery proof.
                  </p>
                </div>
              </div>

              <div className="order-modal-footer">
                <button
                  type="submit"
                  className="modal-confirm-delivery-btn"
                  disabled={deliveryLoading}
                >
                  {deliveryLoading ? "Recording Delivery..." : "✓ Lock & Confirm Delivery"}
                </button>
                <button
                  type="button"
                  className="modal-close-btn"
                  disabled={deliveryLoading}
                  onClick={() => setDeliveryOrder(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shipped Success & WhatsApp Share Dialog */}
      {shippedSuccessOrder && (
        <div className="order-modal-backdrop" onClick={() => setShippedSuccessOrder(null)}>
          <div className="order-modal-card shipping-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="order-modal-header" style={{ borderBottom: "1px solid rgba(22, 163, 74, 0.2)" }}>
              <div>
                <span style={{ fontSize: "10px", color: "#16a34a", fontWeight: 700, letterSpacing: "0.08em" }}>
                  DISPATCH CONFIRMED
                </span>
                <h3 style={{ margin: "3px 0 0" }}>Order #{shippedSuccessOrder.order_number} is Shipped!</h3>
              </div>
              <button
                type="button"
                className="order-modal-close"
                onClick={() => setShippedSuccessOrder(null)}
              >
                ✕
              </button>
            </div>

            <div className="order-modal-body">
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <div style={{ fontSize: "40px", marginBottom: "8px" }}>📦</div>
                <h4 style={{ margin: "0 0 6px", fontSize: "16px", color: "#111827" }}>
                  India Post Tracking Added Successfully!
                </h4>
                <p style={{ margin: "0", fontSize: "12.5px", color: "#4b5563" }}>
                  Consignment Number: <strong style={{ color: "#1e40af", fontFamily: "monospace" }}>{shippedSuccessOrder.tracking_number}</strong>
                </p>
              </div>

              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "6px", padding: "14px", marginBottom: "16px" }}>
                <strong style={{ display: "block", color: "#15803d", marginBottom: "6px", fontSize: "12px" }}>
                  💬 Notify Customer on WhatsApp:
                </strong>
                <p style={{ margin: "0", fontSize: "11.5px", color: "#374151", lineHeight: 1.45 }}>
                  Click below to send a pre-filled WhatsApp message with the India Post tracking link directly to <strong>{shippedSuccessOrder.customer_name}</strong> ({shippedSuccessOrder.customer_phone}).
                </p>
              </div>
            </div>

            <div className="order-modal-footer">
              <a
                href={getTrackingWhatsAppUrl(shippedSuccessOrder)}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-wa-tracking-btn"
                onClick={() => setShippedSuccessOrder(null)}
              >
                💬 Open WhatsApp &amp; Send Tracking
              </a>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShippedSuccessOrder(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminOrders;
