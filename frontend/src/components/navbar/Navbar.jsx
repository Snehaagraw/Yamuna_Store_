import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l5 5" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5.5 20c0.8-3.3 3.1-5 6.5-5s5.7 1.7 6.5 5" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 8.5h14l-1 11H6l-1-11Z" />
      <path d="M9 9V6.5a3 3 0 0 1 6 0V9" />
    </svg>
  );
}

function Navbar() {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { customerUser, isCustomerLoggedIn } = useAuth();

  return (
    <div className="site-header">
      <header className="navbar">
        <Link to="/" className="brand">
          <span className="brand-mark">य</span>

          <span className="brand-text">
            <strong>Yamuna</strong>
            <small>STORE · VRINDAVAN</small>
          </span>
        </Link>

        <nav className="navbar-links">
          <Link to="/">Home</Link>
          <Link to="/collections">Collections</Link>
          <Link to="/about">Visit Us</Link>
          <Link to="/help">Help</Link>
        </nav>

        <div className="navbar-actions">
          <button
            type="button"
            className="nav-icon"
            aria-label="Search Collection"
            title="Search Collection"
            onClick={() => navigate("/collections")}
          >
            <SearchIcon />
          </button>

          <button
            type="button"
            className={`nav-icon ${isCustomerLoggedIn ? "is-logged-in" : ""}`}
            aria-label="My Account"
            title={
              isCustomerLoggedIn
                ? `Account: ${customerUser?.first_name || customerUser?.username || "Devotee"}`
                : "Sign In / Account"
            }
            onClick={() => navigate(isCustomerLoggedIn ? "/account" : "/login")}
          >
            <ProfileIcon />
          </button>

          <button
            type="button"
            className="nav-icon cart-nav-icon"
            aria-label={`Shopping Cart, ${cartCount} items`}
            title="Cart"
            onClick={() => navigate("/cart")}
          >
            <BagIcon />
            <span className="nav-cart-count">{cartCount}</span>
          </button>
        </div>
      </header>

      <div className="announcement-bar">
        DEVOTIONAL CLOTHING · INSPIRED BY VRINDAVAN
      </div>
    </div>
  );
}

export default Navbar;