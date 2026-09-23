import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";

import "./OrderSuccess.css";

function OrderSuccess() {
  const { orderNumber } = useParams();
  const location = useLocation();
  const { customerToken } = useAuth();

  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);

  useEffect(() => {
    if (order || !orderNumber) return;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://127.0.0.1:8000/api/orders/", {
          headers: customerToken ? { Authorization: `Bearer ${customerToken}` } : {},
        });
        const found = response.data.find((o) => o.order_number === orderNumber);
        if (found) {
          setOrder(found);
        }
      } catch (err) {
        console.error("Error fetching order confirmation:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderNumber, customerToken, order]);

  const whatsappMessage = order
    ? encodeURIComponent(
        `Hare Krishna! I have placed order ${order.order_number} for ₹${Number(
          order.total_amount
        ).toLocaleString("en-IN")} on Yamuna Store. Please confirm my order dispatch.`
      )
    : "";

  return (
    <>
      <Navbar />

      <main className="order-success-page">
        <div className="order-success-container">
          <div className="order-success-badge">
            <span className="order-success-mark">य</span>
          </div>

          <span className="order-success-eyebrow">RADHE RADHE · ORDER PLACED</span>
          <h1>Thank you for your order</h1>
          <p className="order-success-subtitle">
            Your devotional attire has been received by Yamuna Store in Vrindavan and is being prepared with care.
          </p>

          <div className="order-number-banner">
            <span>ORDER NUMBER</span>
            <strong>{orderNumber || order?.order_number}</strong>
          </div>

          {order && (
            <div className="order-summary-box">
              <div className="order-summary-grid">
                <div className="order-summary-col">
                  <h4>Delivery Address</h4>
                  <p>
                    <strong>{order.customer_name}</strong>
                    <br />
                    {order.customer_phone}
                    <br />
                    {order.shipping_address}
                    <br />
                    {order.city}, {order.state} - {order.pincode}
                  </p>
                </div>

                <div className="order-summary-col">
                  <h4>Payment & Summary</h4>
                  <p>
                    <strong>Method:</strong> {order.payment_method}
                    <br />
                    <strong>Status:</strong> {order.order_status}
                    <br />
                    <strong>Total Amount:</strong> ₹{Number(order.total_amount).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {order.items && order.items.length > 0 && (
                <div className="order-items-recap">
                  <h4>Ordered Pieces ({order.items.length})</h4>
                  <div className="order-items-list">
                    {order.items.map((item, idx) => (
                      <div key={item.id || idx} className="order-recap-row">
                        <span>{item.quantity}x {item.product_name}</span>
                        <strong>₹{(Number(item.price) * item.quantity).toLocaleString("en-IN")}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="order-success-actions">
            <a
              href={`https://wa.me/916397972342?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-order-btn"
            >
              <span>💬</span> Send Order Copy to Store on WhatsApp
            </a>

            <Link to="/collections" className="continue-shopping-btn">
              Continue Browsing Collection →
            </Link>
          </div>

          <div className="order-support-note">
            <p>
              Need immediate updates on your parcel? Call Haridas Agrawal at{" "}
              <a href="tel:+916397972342">+91 6397972342</a> or Vaibhav Agrawal at{" "}
              <a href="tel:+918533804168">+91 8533804168</a>.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default OrderSuccess;
