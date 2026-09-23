import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";

import "./Checkout.css";

function Checkout() {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { customerUser, customerToken, isCustomerLoggedIn } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    orderNotes: "",
    paymentMethod: "UPI",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Guard: Mandatory login before checkout
  useEffect(() => {
    if (!isCustomerLoggedIn) {
      navigate("/login?redirect=/checkout", { replace: true });
    }
  }, [isCustomerLoggedIn, navigate]);

  // Pre-fill customer information
  useEffect(() => {
    if (customerUser) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || customerUser.first_name || customerUser.username || "",
        email: prev.email || customerUser.email || "",
      }));
    }
  }, [customerUser]);

  // Guard: Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate("/cart");
    }
  }, [cartItems, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.pincode) {
      setError("Please complete all required delivery fields.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        customer_name: formData.name,
        customer_phone: formData.phone,
        customer_email: formData.email,
        shipping_address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        order_notes: formData.orderNotes,
        total_amount: cartTotal,
        payment_method: formData.paymentMethod,
        items: cartItems.map((item) => ({
          product_id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
      };

      const response = await axios.post(
        "http://127.0.0.1:8000/api/orders/",
        payload,
        {
          headers: {
            Authorization: `Bearer ${customerToken}`,
          },
        }
      );

      const createdOrder = response.data;
      clearCart();

      navigate(`/order-success/${createdOrder.order_number}`, {
        state: { order: createdOrder },
      });
    } catch (err) {
      console.error("Order placement error:", err);
      const serverMessage =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        "Unable to place order. Please verify your connection and try again.";
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isCustomerLoggedIn || cartItems.length === 0) {
    return null;
  }

  return (
    <>
      <Navbar />

      <main className="checkout-page">
        <div className="checkout-container">
          <div className="checkout-header">
            <span className="checkout-eyebrow">ORDER FULFILLMENT</span>
            <h1>Delivery & Checkout</h1>
            <p>
              Signed in as <strong>{customerUser?.first_name || customerUser?.username}</strong> ({customerUser?.email}).
              Provide your delivery address below.
            </p>
          </div>

          <form onSubmit={handlePlaceOrder} className="checkout-layout">
            {/* Left Column: Delivery Details */}
            <div className="checkout-left">
              <section className="checkout-card">
                <h2>1. Shipping Address</h2>

                <div className="form-grid">
                  <div className="form-group full-width">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Receiver's Full Name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">WhatsApp / Mobile Number *</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="e.g. devotee@example.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="address">Street Address / House / Ashram No. *</label>
                    <textarea
                      id="address"
                      name="address"
                      rows="3"
                      placeholder="Enter full street, apartment/ashram, landmark"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="city">City / Town *</label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      placeholder="e.g. Vrindavan / Mathura / Delhi"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="state">State *</label>
                    <input
                      id="state"
                      name="state"
                      type="text"
                      placeholder="e.g. Uttar Pradesh"
                      value={formData.state}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="pincode">Pincode *</label>
                    <input
                      id="pincode"
                      name="pincode"
                      type="text"
                      placeholder="e.g. 281121"
                      value={formData.pincode}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="orderNotes">Special Delivery Notes</label>
                    <input
                      id="orderNotes"
                      name="orderNotes"
                      type="text"
                      placeholder="Any landmark or timing notes"
                      value={formData.orderNotes}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </section>

              <section className="checkout-card" style={{ marginTop: "24px" }}>
                <h2>2. Payment Method</h2>

                <div className="payment-options">
                  <label className="payment-option selected">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="UPI"
                      checked={true}
                      readOnly
                    />
                    <div className="payment-option-info">
                      <strong>UPI / Online Payment</strong>
                      <small>Pay securely via Google Pay, PhonePe, Paytm, or any UPI App.</small>
                    </div>
                  </label>
                </div>
              </section>
            </div>

            {/* Right Column: Order Summary */}
            <div className="checkout-right">
              <div className="checkout-summary-card">
                <h2>Order Summary</h2>

                <div className="checkout-items-list">
                  {cartItems.map((item) => (
                    <div key={item.id} className="checkout-item-row">
                      <div className="checkout-item-thumb">
                        {item.image ? (
                          <img src={item.image} alt={item.name} />
                        ) : (
                          <div className="checkout-thumb-placeholder">य</div>
                        )}
                        <span className="checkout-item-qty">{item.quantity}</span>
                      </div>

                      <div className="checkout-item-desc">
                        <h4>{item.name}</h4>
                        <p>{item.category}</p>
                      </div>

                      <div className="checkout-item-price">
                        ₹{(Number(item.price) * item.quantity).toLocaleString("en-IN")}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="checkout-totals">
                  <div className="totals-row">
                    <span>Subtotal</span>
                    <span>₹{cartTotal.toLocaleString("en-IN")}</span>
                  </div>

                  <div className="totals-row">
                    <span>Shipping</span>
                    <span className="shipping-free">FREE (Devotee Offer)</span>
                  </div>

                  <div className="totals-row total-highlight">
                    <span>Total Amount</span>
                    <span>₹{cartTotal.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {error && (
                  <div className="checkout-error" role="alert">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="checkout-place-order-btn"
                  disabled={loading}
                >
                  {loading ? "Placing Order..." : `Place Order (₹${cartTotal.toLocaleString("en-IN")}) →`}
                </button>

                <p className="checkout-guarantee">
                  ✓ Verified Yamuna Store Vrindavan Dispatch<br />
                  ✓ Carefully packed devotional garments
                </p>

                <div className="checkout-back-link">
                  <Link to="/cart">← Return to Cart to modify items</Link>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default Checkout;
