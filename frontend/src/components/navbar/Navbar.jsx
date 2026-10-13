import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/client";
import {
  IconLotus,
  IconWomensAttire,
  IconMensAttire,
  IconKidsAttire,
} from "../common/SacredIcons";


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

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();
  const { customerUser, isCustomerLoggedIn } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [categories, setCategories] = useState([]);
  const [isDropdownHovered, setIsDropdownHovered] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchNavbarCategories = async () => {
      try {
        const response = await api.get("/api/categories/");
        if (isMounted && response.data) {
          setCategories(response.data);
        }
      } catch (err) {
        console.warn("Could not load categories for navbar:", err);
      }
    };
    fetchNavbarCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  const womenCategories = categories.filter(
    (c) => (c.section || "women") === "women"
  );
  const menCategories = categories.filter((c) => c.section === "men");
  const kidsCategories = categories.filter((c) => c.section === "kids");

  // Close mobile menu whenever route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDropdownHovered(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is active
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="site-header">
      <header className="navbar">
        <Link to="/" className="brand" onClick={() => setIsMobileMenuOpen(false)}>
          <span className="brand-mark">य</span>

          <span className="brand-text">
            <strong>Yamuna</strong>
            <small>STORE · VRINDAVAN</small>
          </span>
        </Link>

        <nav className="navbar-links">
          <Link to="/">Home</Link>

          {/* Collections with Mega Dropdown on Hover */}
          <div
            className="navbar-item-with-dropdown"
            onMouseEnter={() => setIsDropdownHovered(true)}
            onMouseLeave={() => setIsDropdownHovered(false)}
          >
            <Link
              to="/collections"
              className={`nav-collection-trigger ${
                isDropdownHovered ? "active" : ""
              }`}
            >
              Collections
              <span className="nav-dropdown-chevron" aria-hidden="true">
                ▾
              </span>
            </Link>

            {/* Mega Dropdown Menu */}
            <div
              className={`navbar-mega-dropdown ${
                isDropdownHovered ? "is-visible" : ""
              }`}
            >
              <div className="mega-dropdown-inner">
                {/* Column 1: Women */}
                <div className="mega-column">
                  <div className="mega-column-header">
                    <span className="mega-icon"><IconWomensAttire size={18} /></span>
                    <Link
                      to="/collections?section=women"
                      className="mega-title-link"
                      onClick={() => setIsDropdownHovered(false)}
                    >
                      Women's
                    </Link>
                  </div>
                  <ul className="mega-category-list">
                    {womenCategories.length > 0 ? (
                      womenCategories.map((cat) => (
                        <li key={cat.id}>
                          <Link
                            to={`/collections?section=women&category=${encodeURIComponent(
                              cat.name
                            )}`}
                            onClick={() => setIsDropdownHovered(false)}
                          >
                            {cat.name}
                          </Link>
                        </li>
                      ))
                    ) : (
                      <>
                        <li>
                          <Link
                            to="/collections?section=women&category=Gopi+Dress"
                            onClick={() => setIsDropdownHovered(false)}
                          >
                            Gopi Dress
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/collections?section=women&category=Sarees"
                            onClick={() => setIsDropdownHovered(false)}
                          >
                            Sarees
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/collections?section=women&category=Kurties"
                            onClick={() => setIsDropdownHovered(false)}
                          >
                            Kurties
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/collections?section=women&category=Dupattas"
                            onClick={() => setIsDropdownHovered(false)}
                          >
                            Dupattas
                          </Link>
                        </li>
                      </>
                    )}
                    <li className="mega-view-all">
                      <Link
                        to="/collections?section=women"
                        onClick={() => setIsDropdownHovered(false)}
                      >
                        All Women's Attire →
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Column 2: Men */}
                <div className="mega-column">
                  <div className="mega-column-header">
                    <span className="mega-icon"><IconMensAttire size={18} /></span>
                    <Link
                      to="/collections?section=men"
                      className="mega-title-link"
                      onClick={() => setIsDropdownHovered(false)}
                    >
                      Men's
                    </Link>
                  </div>
                  <ul className="mega-category-list">
                    {menCategories.length > 0 ? (
                      menCategories.map((cat) => (
                        <li key={cat.id}>
                          <Link
                            to={`/collections?section=men&category=${encodeURIComponent(
                              cat.name
                            )}`}
                            onClick={() => setIsDropdownHovered(false)}
                          >
                            {cat.name}
                          </Link>
                        </li>
                      ))
                    ) : (
                      <>
                        <li>
                          <Link
                            to="/collections?section=men&category=Dhoti+Kurta"
                            onClick={() => setIsDropdownHovered(false)}
                          >
                            Dhoti Kurta
                          </Link>
                        </li>
                      </>
                    )}
                    <li className="mega-view-all">
                      <Link
                        to="/collections?section=men"
                        onClick={() => setIsDropdownHovered(false)}
                      >
                        All Men's Attire →
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Column 3: Kids */}
                <div className="mega-column">
                  <div className="mega-column-header">
                    <span className="mega-icon"><IconKidsAttire size={18} /></span>
                    <Link
                      to="/collections?section=kids"
                      className="mega-title-link"
                      onClick={() => setIsDropdownHovered(false)}
                    >
                      Kids'
                    </Link>
                  </div>
                  <ul className="mega-category-list">
                    {kidsCategories.length > 0 ? (
                      kidsCategories.map((cat) => (
                        <li key={cat.id}>
                          <Link
                            to={`/collections?section=kids&category=${encodeURIComponent(
                              cat.name
                            )}`}
                            onClick={() => setIsDropdownHovered(false)}
                          >
                            {cat.name}
                          </Link>
                        </li>
                      ))
                    ) : (
                      <>
                        <li>
                          <Link
                            to="/collections?section=kids&category=Kids+Dhoti+Kurta"
                            onClick={() => setIsDropdownHovered(false)}
                          >
                            Kids Dhoti Kurta
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/collections?section=kids&category=Kids+Gopi+Dress"
                            onClick={() => setIsDropdownHovered(false)}
                          >
                            Kids Gopi Dress
                          </Link>
                        </li>
                      </>
                    )}
                    <li className="mega-view-all">
                      <Link
                        to="/collections?section=kids"
                        onClick={() => setIsDropdownHovered(false)}
                      >
                        All Kids' Attire →
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Mega Dropdown Footer Banner */}
              <div className="mega-dropdown-footer">
                <Link
                  to="/collections"
                  className="mega-all-collections-btn"
                  onClick={() => setIsDropdownHovered(false)}
                >
                  <IconLotus size={16} />
                  <span>View Complete Vrindavan Catalog (All Collections) →</span>
                </Link>
              </div>
            </div>
          </div>

          <Link to="/about">Visit Us</Link>
          <Link to="/help">Help</Link>
        </nav>

        <div className="navbar-actions">
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

          <button
            type="button"
            className="nav-icon mobile-menu-toggle"
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            title="Menu"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </header>

      <div className="announcement-bar">
        DEVOTIONAL CLOTHING · INSPIRED BY VRINDAVAN
      </div>

      {/* Mobile Drawer Backdrop */}
      <div
        className={`mobile-drawer-backdrop ${isMobileMenuOpen ? "is-open" : ""}`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Slide-Out Drawer */}
      <nav
        className={`mobile-drawer ${isMobileMenuOpen ? "is-open" : ""}`}
        aria-label="Mobile Navigation"
      >
        <div className="mobile-drawer-header">
          <div className="mobile-drawer-brand">
            <span className="brand-mark">य</span>
            <span className="brand-text">
              <strong>Yamuna</strong>
              <small>VRINDAVAN</small>
            </span>
          </div>

          <button
            type="button"
            className="mobile-drawer-close"
            aria-label="Close menu"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="mobile-drawer-links">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
            Home
          </Link>

          <div className="mobile-drawer-section">
            <Link
              to="/collections"
              className="mobile-drawer-main-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Collections (All Pieces)
            </Link>
            <div className="mobile-drawer-sublinks">
              <Link
                to="/collections?section=women"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span>
                  <IconWomensAttire size={16} /> Women's Attire
                </span>
              </Link>
              <Link
                to="/collections?section=men"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span>
                  <IconMensAttire size={16} /> Men's Attire
                </span>
              </Link>
              <Link
                to="/collections?section=kids"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span>
                  <IconKidsAttire size={16} /> Kids' Attire
                </span>
              </Link>
            </div>
          </div>

          <Link to="/about" onClick={() => setIsMobileMenuOpen(false)}>
            Visit Us
          </Link>
          <Link to="/help" onClick={() => setIsMobileMenuOpen(false)}>
            Help & FAQ
          </Link>
        </div>

        <div className="mobile-drawer-account">
          <Link
            to={isCustomerLoggedIn ? "/account" : "/login"}
            className="mobile-account-link"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <ProfileIcon />
            <span>
              {isCustomerLoggedIn
                ? `Account (${customerUser?.first_name || customerUser?.username || "Devotee"})`
                : "Sign In / Register"}
            </span>
          </Link>

          <Link
            to="/cart"
            className="mobile-cart-link"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <BagIcon />
            <span>Shopping Cart ({cartCount})</span>
          </Link>
        </div>

        <div className="mobile-drawer-footer">
          <p className="mobile-drawer-tagline">
            DEVOTIONAL CLOTHING · INSPIRED BY VRINDAVAN
          </p>
          <span className="mobile-drawer-greeting">॥ श्री राधेश्याम ॥</span>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;