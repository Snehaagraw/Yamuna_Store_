import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { COUNTRIES, getCountryByName, splitPhoneAndDialCode } from "../../constants/countries";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";

import "./CustomerAccount.css";

function CustomerAccount() {
  const navigate = useNavigate();
  const { customerUser, customerToken, isCustomerLoggedIn, customerLogout, updateCustomerAddress } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressFormData, setAddressFormData] = useState({
    name: "",
    country: "India",
    dialCode: "+91",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressMessage, setAddressMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (customerUser?.saved_address) {
      const savedCountry = customerUser.saved_address.country || "India";
      const { dialCode: parsedDialCode, phone: parsedPhone } = splitPhoneAndDialCode(
        customerUser.saved_address.phone || "",
        savedCountry
      );

      setAddressFormData({
        name: customerUser.saved_address.name || "",
        country: savedCountry,
        dialCode: parsedDialCode || "+91",
        phone: parsedPhone || "",
        address: customerUser.saved_address.address || "",
        city: customerUser.saved_address.city || "",
        state: customerUser.saved_address.state || "",
        pincode: customerUser.saved_address.pincode || "",
      });
    }
  }, [customerUser?.saved_address]);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCountryChange = (e) => {
    const selectedCountry = e.target.value;
    const countryObj = getCountryByName(selectedCountry);
    setAddressFormData((prev) => ({
      ...prev,
      country: selectedCountry,
      dialCode: countryObj.dialCode !== "+" ? countryObj.dialCode : prev.dialCode,
    }));
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setAddressSaving(true);
    setAddressMessage({ type: "", text: "" });

    const fullPhone = addressFormData.phone
      ? `${addressFormData.dialCode.trim()} ${addressFormData.phone.trim()}`.trim()
      : "";

    const payload = {
      name: addressFormData.name,
      country: addressFormData.country,
      phone: fullPhone,
      address: addressFormData.address,
      city: addressFormData.city,
      state: addressFormData.state,
      pincode: addressFormData.pincode,
    };

    const result = await updateCustomerAddress(payload);
    setAddressSaving(false);

    if (result.success) {
      setAddressMessage({ type: "success", text: "Delivery address updated successfully." });
      setIsEditingAddress(false);
    } else {
      setAddressMessage({ type: "error", text: result.error || "Failed to update address." });
    }
  };

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
        const response = await api.get("/api/orders/?mine=true", {
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

          {/* Saved Delivery Address Card */}
          <section className="account-address-card">
            <div className="account-address-header">
              <div>
                <span className="account-eyebrow">SAVED DELIVERY ADDRESS</span>
                <h2>Default Shipping Details</h2>
              </div>

              {!isEditingAddress && (
                <button
                  type="button"
                  className="account-edit-address-btn"
                  onClick={() => setIsEditingAddress(true)}
                >
                  {customerUser?.saved_address?.address ? "Edit Address" : "+ Add Delivery Address"}
                </button>
              )}
            </div>

            {addressMessage.text && (
              <div className={`account-address-alert ${addressMessage.type}`}>
                {addressMessage.text}
              </div>
            )}

            {!isEditingAddress ? (
              <div className="account-address-content">
                {customerUser?.saved_address?.address ? (
                  <div className="saved-address-details">
                    <p className="saved-address-name">
                      <strong>Recipient:</strong> {customerUser.saved_address.name || customerUser.first_name || customerUser.username}
                    </p>
                    <p className="saved-address-country">
                      <strong>Country:</strong> {customerUser.saved_address.country || "India"}
                    </p>
                    <p className="saved-address-phone">
                      <strong>WhatsApp / Phone:</strong> {customerUser.saved_address.phone || "Not specified"}
                    </p>
                    <p className="saved-address-line">
                      <strong>Address:</strong> {customerUser.saved_address.address}
                    </p>
                    <p className="saved-address-locality">
                      <strong>Location:</strong> {customerUser.saved_address.city}, {customerUser.saved_address.state} - {customerUser.saved_address.pincode}
                    </p>
                    <small className="saved-address-badge-note">
                      ✓ Automatically pre-fills during checkout so you don't have to re-enter it.
                    </small>
                  </div>
                ) : (
                  <div className="saved-address-empty">
                    <p>No delivery address saved yet.</p>
                    <small>
                      When you enter your address at checkout, it will automatically be saved to your account, or you can add it here now.
                    </small>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSaveAddress} className="account-address-form">
                <div className="address-form-grid">
                  <div className="address-form-group">
                    <label htmlFor="addr-name">Full Name *</label>
                    <input
                      id="addr-name"
                      name="name"
                      type="text"
                      placeholder="Receiver's Full Name"
                      value={addressFormData.name}
                      onChange={handleAddressChange}
                      required
                    />
                  </div>

                  <div className="address-form-group">
                    <label htmlFor="addr-country">Country / Region *</label>
                    <select
                      id="addr-country"
                      name="country"
                      className="account-country-select"
                      value={addressFormData.country}
                      onChange={handleCountryChange}
                      required
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.name}>
                          {c.flag} {c.name} ({c.dialCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="address-form-group full-width">
                    <label htmlFor="addr-phone">WhatsApp / Mobile *</label>
                    <div className="phone-input-group">
                      <select
                        className="phone-dial-select"
                        name="dialCode"
                        value={addressFormData.dialCode}
                        onChange={handleAddressChange}
                        aria-label="Country Dial Code"
                      >
                        {COUNTRIES.filter((c) => c.dialCode !== "+").map((c) => (
                          <option key={c.code} value={c.dialCode}>
                            {c.flag} {c.dialCode} ({c.name})
                          </option>
                        ))}
                      </select>
                      <input
                        id="addr-phone"
                        name="phone"
                        type="tel"
                        className="phone-number-input"
                        placeholder="Subscriber number"
                        value={addressFormData.phone}
                        onChange={handleAddressChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="address-form-group full-width">
                    <label htmlFor="addr-address">Street Address / House / Ashram No. *</label>
                    <textarea
                      id="addr-address"
                      name="address"
                      rows="2"
                      placeholder="Full street address, landmark"
                      value={addressFormData.address}
                      onChange={handleAddressChange}
                      required
                    />
                  </div>

                  <div className="address-form-group">
                    <label htmlFor="addr-city">City / Town *</label>
                    <input
                      id="addr-city"
                      name="city"
                      type="text"
                      placeholder="e.g. Vrindavan / New York / London"
                      value={addressFormData.city}
                      onChange={handleAddressChange}
                      required
                    />
                  </div>

                  <div className="address-form-group">
                    <label htmlFor="addr-state">State / Province / Region *</label>
                    <input
                      id="addr-state"
                      name="state"
                      type="text"
                      placeholder="e.g. Uttar Pradesh / California"
                      value={addressFormData.state}
                      onChange={handleAddressChange}
                      required
                    />
                  </div>

                  <div className="address-form-group">
                    <label htmlFor="addr-pincode">Pincode / Postal Code *</label>
                    <input
                      id="addr-pincode"
                      name="pincode"
                      type="text"
                      placeholder="e.g. 281121 / 10001"
                      value={addressFormData.pincode}
                      onChange={handleAddressChange}
                      required
                    />
                  </div>
                </div>

                <div className="address-form-actions">
                  <button
                    type="button"
                    className="address-cancel-btn"
                    onClick={() => {
                      setIsEditingAddress(false);
                      setAddressMessage({ type: "", text: "" });
                    }}
                    disabled={addressSaving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="address-save-btn"
                    disabled={addressSaving}
                  >
                    {addressSaving ? "Saving..." : "Save Delivery Address"}
                  </button>
                </div>
              </form>
            )}
          </section>

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
                          <div style={{ textAlign: "right" }}>
                            <span className="order-card-total">
                              ₹{Number(order.total_amount).toLocaleString("en-IN")}
                            </span>
                            {order.shipping_carrier && (
                              <div>
                                <small style={{ fontSize: "9.5px", color: "rgba(93, 30, 52, 0.7)" }}>
                                  {order.shipping_carrier} {order.total_weight ? `· ${order.total_weight}` : ""}
                                </small>
                              </div>
                            )}
                          </div>
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
                            {order.shipping_address}, {order.city}, {order.state} - {order.pincode} ({order.country || "India"})
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
