function QuantityControl({ quantity, onDecrease, onIncrease }) {
  return (
    <div className="quantity-control">
      <button
        type="button"
        className="quantity-button"
        onClick={onDecrease}
        aria-label="Decrease quantity"
      >
        −
      </button>

      <span className="quantity-value">{quantity}</span>

      <button
        type="button"
        className="quantity-button"
        onClick={onIncrease}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}

export default QuantityControl;