import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";

import "./CustomerAccount.css";

function CustomerAccount() {
  const navigate = useNavigate();
  const { customerUser, customerToken, isCustomerLoggedIn, customerLogout } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Guard: if not logged in, redirect to login
  useEffect(() => {
    if (!isCustomerLoggedIn) {
      navigate("/login?redirect=/account", { replace: true });
    }
  }, [isCustomerLoggedIn, navigate]);

  useEffect(() => {
    if (!customerToken) {
      setOrders([]);
      return;
    }

    const fetchCustomerOrders = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await axios.get("http://127.0.0.1:8000/api/orders/?mine=true", {
          headers: {
            Authorization: `Bearer ${customerToken}`,
          },
        });
        setOrders(response.data);
      } catch (err) {
        console.error("Error loading customer orders:", err);
        setError("Unable to load your past orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerOrders();
  }, [customerToken, customerUser?.id]);

  const handleLogout = () => {
    setOrders([]);
    customerLogout();
    navigate("/", { replace: true });
  };

  if (!isCustomerLoggedIn) {
    return null;
  }

  const getStatusStep = (status) => {
    switch (status) {
      case "Pending":
        return 1;
      case "Confirmed":
      case "Processing":
        return 2;
      case "Shipped":
        return 3;
      case "Delivered":
        return 4;
      case "Cancelled":
        return -1;
      default:
        return 1;
    }
  };

  return (
    <>
      <Navbar />

      <main className="customer-account-page">
        <div className="customer-account-container">
          {/* Profile Header Card */}
          <div className="account-profile-header">
            <div className="account-profile-info">
              <div className="account-avatar">य</div>
              <div className="account-details">
                <span className="account-eyebrow">RADHE RADHE · DEVOTEE PROFILE</span>
                <h1>{customerUser?.first_name || customerUser?.username || "Devotee"}</h1>
                <p>
                  <strong>Email:</strong> {customerUser?.email || customerUser?.username}
                </p>
              </div>
            </div>

            <div className="account-profile-actions">
              <button
                type="button"
                className="account-logout-btn"
                onClick={handleLogout}
              >
                Log Out
              </button>
            </div>
          </div>

          {/* Orders Section */}
          <section className="account-orders-section">
            <div className="account-orders-heading">
              <div>
                <span className="account-eyebrow">PURCHASE HISTORY & STATUS</span>
                <h2>My Orders ({orders.length})</h2>
              </div>

              <Link to="/collections" className="browse-more-link">
                + Browse More Pieces
              </Link>
            </div>

            {loading && (
              <div className="account-status-message">
                <p>Loading your orders...</p>
              </div>
            )}

            {error && (
              <div className="account-status-message error">
                <p>{error}</p>
              </div>
            )}

            {!loading && !error && orders.length === 0 && (
              <div className="account-orders-empty">
                <div className="empty-symbol">य</div>
                <h3>No orders placed yet</h3>
                <p>
                  Your devotional orders will appear here with live tracking once you complete checkout.
                </p>
                <Link to="/collections" className="account-shop-now-btn">
                  Explore Collection →
                </Link>
              </div>
            )}

            {!loading && !error && orders.length > 0 && (
              <div className="account-orders-list">
                {orders.map((order) => {
                  const step = getStatusStep(order.order_status);
                  const isCancelled = order.order_status === "Cancelled";

                  return (
                    <article key={order.id} className="account-order-card">
                      {/* Top Bar */}
                      <div className="order-card-header">
                        <div className="order-meta">
                          <span className="order-number-tag">
                            ORDER <strong>{order.order_number}</strong>
                          </span>
                          <span className="order-date-tag">
                            Placed on{" "}
                            {new Date(order.created_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>

                        <div className="order-header-right">
                          <span className={`order-status-badge status-${order.order_status.toLowerCase()}`}>
                            {order.order_status}
                          </span>
                          <span className="order-card-total">
                            ₹{Number(order.total_amount).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>

                      {/* Tracker Steps (if not cancelled) */}
                      {!isCancelled && (
                        <div className="order-tracker">
                          <div className={`tracker-step ${step >= 1 ? "active" : ""}`}>
                            <span className="step-circle">{step >= 1 ? "✓" : "1"}</span>
                            <span className="step-label">Order Placed</span>
                          </div>
                          <div className={`tracker-line ${step >= 2 ? "active" : ""}`} />
                          <div className={`tracker-step ${step >= 2 ? "active" : ""}`}>
                            <span className="step-circle">{step >= 2 ? "✓" : "2"}</span>
                            <span className="step-label">Confirmed & Tailored</span>
                          </div>
                          <div className={`tracker-line ${step >= 3 ? "active" : ""}`} />
                          <div className={`tracker-step ${step >= 3 ? "active" : ""}`}>
                            <span className="step-circle">{step >= 3 ? "✓" : "3"}</span>
                            <span className="step-label">Dispatched</span>
                          </div>
                          <div className={`tracker-line ${step >= 4 ? "active" : ""}`} />
                          <div className={`tracker-step ${step >= 4 ? "active" : ""}`}>
                            <span className="step-circle">{step >= 4 ? "✓" : "4"}</span>
                            <span className="step-label">Delivered</span>
                          </div>
                        </div>
                      )}

                      {/* Items List */}
                      <div className="order-card-items">
                        <h4>Items in this order:</h4>
                        <div className="order-items-grid">
                          {order.items?.map((item, idx) => (
                            <div key={item.id || idx} className="order-card-item">
                              <div className="item-thumb-wrapper">
                                {item.image_url ? (
                                  <img src={item.image_url} alt={item.product_name} />
                                ) : (
                                  <div className="thumb-placeholder">य</div>
                                )}
                              </div>
                              <div className="item-details">
                                <strong>{item.product_name}</strong>
                                <small>
                                  Qty: {item.quantity} · ₹{Number(item.price).toLocaleString("en-IN")} each
                                </small>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Bottom Footer Info */}
                      <div className="order-card-footer">
                        <div className="order-delivery-address">
                          <strong>Delivery Address:</strong>{" "}
                          <span>
                            {order.shipping_address}, {order.city}, {order.state} - {order.pincode}
                          </span>
                        </div>

                        <a
                          href={`https://wa.me/916397972342?text=Hare%20Krishna%2C%20I%20have%20an%20inquiry%20regarding%20my%20Yamuna%20Store%20order%20${order.order_number}.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="order-whatsapp-help"
                        >
                          💬 Help with this order
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default CustomerAccount;
