import QuantityControl from "./QuantityControl";

function CartItem({
  item,
  onDecrease,
  onIncrease,
  onRemove,
}) {
  const {
    product,
    quantity,
  } = item;

  return (
    <article className="cart-item">
      <div className="cart-item-image-wrapper">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="cart-item-image"
          />
        ) : (
          <div className="cart-item-image-placeholder">
            Product Image
          </div>
        )}
      </div>

      <div className="cart-item-details">
        <p className="cart-item-category">
          {product.category}
        </p>

        <h3 className="cart-item-name">
          {product.name}
        </h3>

        <p className="cart-item-price">
          ₹{product.price}
        </p>

        <QuantityControl
          quantity={quantity}
          onDecrease={() => onDecrease(item)}
          onIncrease={() => onIncrease(item)}
        />
      </div>

      <button
        type="button"
        className="cart-item-remove"
        onClick={() => onRemove(item)}
        aria-label={`Remove ${product.name} from cart`}
      >
        ×
      </button>
    </article>
  );
}

export default CartItem;