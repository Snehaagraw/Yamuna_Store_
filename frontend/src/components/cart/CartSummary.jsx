function CartSummary({
  subtotal = 0,
  totalWeight = "",
  onCheckout,
}) {
  return (
    <aside className="cart-summary">
      <div className="cart-summary-header">
        <h2>Order Summary</h2>
      </div>

      <div className="cart-summary-row">
        <span>Subtotal</span>
        <span>₹{Number(subtotal).toLocaleString("en-IN")}</span>
      </div>

      {totalWeight && (
        <div className="cart-summary-row" style={{ color: "var(--maroon-dark)" }}>
          <span>Parcel Weight</span>
          <span style={{ fontWeight: 600 }}>⚖️ {totalWeight}</span>
        </div>
      )}

      <div className="cart-summary-row">
        <span>Delivery Carrier</span>
        <span style={{ fontSize: "10.5px", textAlign: "right" }}>
          India Post / DHL Express
        </span>
      </div>

      <div className="cart-summary-total">
        <span>Subtotal</span>
        <span>₹{Number(subtotal).toLocaleString("en-IN")}</span>
      </div>

      <p
        style={{
          margin: "12px 0 16px",
          fontSize: "10px",
          lineHeight: "1.5",
          color: "rgba(93, 30, 52, 0.72)",
          fontFamily: "'DM Mono', monospace",
        }}
      >
        Exact shipping charges calculated on next step based on parcel weight &amp; destination pin code.
      </p>

      <button
        type="button"
        className="checkout-button"
        onClick={onCheckout}
      >
        Proceed to Checkout →
      </button>
    </aside>
  );
}

export default CartSummary;