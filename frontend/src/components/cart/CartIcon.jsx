function CartIcon({ itemCount = 0, onClick }) {
  return (
    <button
      className="icon-button cart-button"
      aria-label={`Shopping cart with ${itemCount} items`}
      onClick={onClick}
    >
      <span className="cart-icon">🛍</span>

      {itemCount > 0 && (
        <span className="cart-count">{itemCount}</span>
      )}
    </button>
  );
}

export default CartIcon;