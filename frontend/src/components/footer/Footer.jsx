import { Link } from "react-router-dom";

const INSTAGRAM_URL = "https://www.instagram.com/yamuna_store_vrindavan/";
const FACEBOOK_URL = "https://www.facebook.com/share/1H392atmQM/";
const WHATSAPP_URL = "https://wa.me/918533804168";
const EMAIL_ADDRESS = "mailto:agrawaljii31415@gmail.com";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <span className="footer-logo-mark">य</span>

            <span className="footer-logo-text">
              <strong>Yamuna</strong>
              <small>STORE · VRINDAVAN</small>
            </span>
          </Link>

          <p className="footer-tagline">
            Traditional devotional clothing,
            <br />
            rooted in the spirit of Vrindavan.
          </p>

          {/* Social & Contact Icons */}
          <div className="footer-social-icons">
            {/* Instagram */}
            <a
              href={"https://www.instagram.com/yamuna_store_vrindavan/"}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle
                  cx="17.5"
                  cy="6.5"
                  r="1"
                  fill="currentColor"
                  stroke="none"
                />
              </svg>
            </a>

            {/* WhatsApp */}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.5 11.5a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.7-4.2A8.5 8.5 0 1 1 20.5 11.5Z" />
                <path d="M8.8 8.5c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.7c.1.2.1.4-.1.6l-.6.7c.7 1.2 1.7 2.2 2.9 2.9l.7-.6c.2-.2.4-.2.6-.1l1.7.7c.3.1.4.3.4.5v.5c0 .3 0 .5-.4.7-.4.2-1.1.3-1.7.1-1.1-.3-2.5-1.1-3.8-2.4-1.3-1.3-2.1-2.7-2.4-3.8-.2-.6-.1-1.3.3-1.7Z" />
              </svg>
            </a>

            {/* Facebook */}
            <a
              href={FACEBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M14 21v-8h2.7l.4-3H14V8.1c0-.9.3-1.5 1.6-1.5h1.7V4a22 22 0 0 0-2.5-.1C12.3 3.9 11 5.1 11 7.5V10H8.5v3H11v8" />
              </svg>
            </a>

            {/* Email */}
            <a
              href={EMAIL_ADDRESS}
              aria-label="Email"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m4 7 8 6 8-6" />
              </svg>
            </a>
          </div>
        </div>

        <div className="footer-column">
          <h3>Explore</h3>

          <Link to="/">Home</Link>
          <Link to="/collections">Collections</Link>
          <Link to="/about">Visit Us</Link>
          <Link to="/help">Help & FAQ</Link>
          <Link to="/account">My Account & Orders</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/admin/login">Admin Portal</Link>
        </div>

        <div className="footer-column">
          <h3>Customer Care</h3>

          <Link to="/refund-policy">Refund & Cancellation</Link>
          <Link to="/shipping-policy">Shipping & Delivery</Link>
          <Link to="/terms-and-conditions">Terms & Conditions</Link>
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/about">Contact & Store Info</Link>
        </div>

        <div className="footer-column footer-contact">
          <h3>Visit Us</h3>

          <p>
            Inside Nidhivan Plaza, Near Nidhivan Temple, Vrindavan, 281121
            <br />
            Uttar Pradesh, India
          </p>

          <p>
            <a href="tel:+918533804168" style={{ color: "var(--gold)", textDecoration: "none" }}>
              📞 +91 8533804168
            </a>
            <br />
            <a href="mailto:agrawaljii31415@gmail.com" style={{ color: "rgba(247, 233, 201, 0.72)", textDecoration: "none" }}>
              ✉️ agrawaljii31415@gmail.com
            </a>
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 Yamuna Store. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;