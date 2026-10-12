import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useCurrency } from "../../context/CurrencyContext";
import "./CurrencyFloatingWidget.css";

function CurrencyFloatingWidget() {
  const { pathname } = useLocation();
  const { selectedCurrency, currencies, setCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Display only on Collections and Product Details pages
  const isTargetPage =
    pathname.startsWith("/collections") || pathname.startsWith("/product/");

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close when route changes
  useEffect(() => {
    setIsOpen(false);
    setSearchTerm("");
  }, [pathname]);

  if (!isTargetPage) {
    return null;
  }

  const filteredCurrencies = currencies.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (code) => {
    setCurrency(code);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <aside
      className="currency-floating-widget"
      ref={dropdownRef}
      aria-label="Currency Converter"
    >
      {/* Floating Trigger Button */}
      <button
        type="button"
        className={`currency-floating-trigger ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        title="Change display currency"
      >
        <span className="floating-flag" aria-hidden="true">
          {selectedCurrency.flag}
        </span>
        <span className="floating-curr-info">
          <strong>{selectedCurrency.code}</strong>
          <small>{selectedCurrency.symbol}</small>
        </span>
        <span className="floating-arrow" aria-hidden="true">
          {isOpen ? "✕" : "▲"}
        </span>
      </button>

      {/* Flyout Modal / Card */}
      {isOpen && (
        <div className="currency-modal-card" role="dialog" aria-modal="true">
          <div className="currency-modal-header">
            <div className="modal-title-group">
              <span className="modal-globe-icon" aria-hidden="true">
                🌍
              </span>
              <div>
                <h4>Select Currency</h4>
                <p>Prices convert in real time for international devotees</p>
              </div>
            </div>
            <button
              type="button"
              className="currency-modal-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close currency menu"
            >
              ✕
            </button>
          </div>

          <div className="currency-search-container">
            <input
              type="text"
              placeholder="Search country or currency..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="currency-search-field"
              autoFocus
            />
            {searchTerm && (
              <button
                type="button"
                className="currency-search-clear"
                onClick={() => setSearchTerm("")}
              >
                ✕
              </button>
            )}
          </div>

          <div className="currency-list-scroll">
            {filteredCurrencies.map((c) => {
              const isSelected = c.code === selectedCurrency.code;
              return (
                <button
                  key={c.code}
                  type="button"
                  className={`currency-list-item ${
                    isSelected ? "is-selected" : ""
                  }`}
                  onClick={() => handleSelect(c.code)}
                >
                  <span className="currency-item-flag">{c.flag}</span>
                  <div className="currency-item-details">
                    <span className="currency-item-name">{c.name}</span>
                    <span className="currency-item-code">
                      {c.code} ({c.symbol})
                    </span>
                  </div>
                  {isSelected && (
                    <span className="currency-selected-badge" aria-label="Selected">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}

            {filteredCurrencies.length === 0 && (
              <div className="currency-no-results">
                <p>No currencies found matching "{searchTerm}"</p>
              </div>
            )}
          </div>

          <div className="currency-modal-footer">
            <span className="currency-footer-icon">🌸</span>
            <p>
              Display estimates convert live from INR (₹). Secure checkout
              charges in Indian Rupees equivalent.
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}

export default CurrencyFloatingWidget;
