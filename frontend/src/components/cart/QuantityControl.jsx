function QuantityControl({ quantity, onDecrease, onIncrease, disabledIncrease = false }) {
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
        className={`quantity-button ${disabledIncrease ? "disabled" : ""}`}
        onClick={onIncrease}
        disabled={disabledIncrease}
        title={disabledIncrease ? "Maximum available stock reached" : "Increase quantity"}
        aria-label="Increase quantity"
        style={disabledIncrease ? { opacity: 0.35, cursor: "not-allowed" } : {}}
      >
        +
      </button>
    </div>
  );
}

export default QuantityControl;