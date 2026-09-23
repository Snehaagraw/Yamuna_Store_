function CartSummary({
  subtotal = 0,
  onCheckout,
}) {
  return (
    <aside className="cart-summary">
      <div className="cart-summary-header">
        <h2>Order Summary</h2>
      </div>

      <div className="cart-summary-row">
        <span>Subtotal</span>
        <span>₹{subtotal}</span>
      </div>

      <div className="cart-summary-row">
        <span>Delivery</span>
        <span>Calculated at checkout</span>
      </div>

      <div className="cart-summary-total">
        <span>Total</span>
        <span>₹{subtotal}</span>
      </div>

      <button
        type="button"
        className="checkout-button"
        onClick={onCheckout}
      >
        Proceed to Checkout
      </button>
    </aside>
  );
}

export default CartSummary;