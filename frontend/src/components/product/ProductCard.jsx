
function ProductCard({ product, onClick }) {
  const image = product.images?.[0]?.image || product.image;

  const isNewCollection =
    product.is_new_collection ?? product.isNewCollection ?? false;

  const isBestSeller =
    product.is_best_seller ?? product.isBestSeller ?? false;

  return (
    <article
      className="product-card"
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(event) => {
        if (onClick && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <div className="product-image-wrapper">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="product-image"
          />
        ) : (
          <div className="product-image-placeholder">
            Product Image
          </div>
        )}

        {(isNewCollection || isBestSeller) && (
          <div className="product-badges">
            {isNewCollection && (
              <span className="product-badge">New</span>
            )}

            {isBestSeller && (
              <span className="product-badge">Best Seller</span>
            )}
          </div>
        )}
      </div>

      <div className="product-info">
        <p className="product-category">{product.category}</p>

        <h3 className="product-name">{product.name}</h3>

        <p className="product-price">
          ₹{Number(product.price).toLocaleString("en-IN")}
        </p>
      </div>
    </article>
  );
}

export default ProductCard;