
import { useCurrency } from "../../context/CurrencyContext";

function ProductCard({ product, onClick }) {
  const { formatPrice } = useCurrency();

  const primaryImage =
    product.images?.[0]?.image ||
    product.image ||
    (Array.isArray(product.images) && typeof product.images[0] === "string"
      ? product.images[0]
      : "");

  const secondaryImage =
    product.images && product.images.length > 1
      ? product.images[1]?.image ||
        (typeof product.images[1] === "string" ? product.images[1] : null)
      : null;

  const categoryName =
    typeof product.category === "string"
      ? product.category
      : product.category_details?.name || "";

  const isNewCollection =
    product.is_new_collection ?? product.isNewCollection ?? false;

  const isBestSeller =
    product.is_best_seller ?? product.isBestSeller ?? false;

  const isOutOfStock =
    product.stock_status === "Out of Stock" ||
    (typeof product.stock_status === "string" &&
      product.stock_status.toLowerCase().includes("out"));

  const sizePricesList =
    product.size_prices && typeof product.size_prices === "object"
      ? Object.values(product.size_prices)
          .map(Number)
          .filter((p) => !isNaN(p) && p > 0)
      : [];

  const hasVaryingPrices =
    sizePricesList.length > 0 &&
    Math.min(...sizePricesList) !== Math.max(...sizePricesList);

  const displayBasePrice =
    hasVaryingPrices ? Math.min(...sizePricesList) : product.price;

  const priceInfo = formatPrice(displayBasePrice);

  return (
    <article
      className={`product-card ${isOutOfStock ? "is-sold-out" : ""}`}
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
      <div
        className={`product-image-wrapper ${
          secondaryImage ? "has-secondary" : ""
        }`}
      >
        {primaryImage ? (
          <>
            <img
              src={primaryImage}
              alt={product.name || "Sacred Vrindavan Attire"}
              className="product-image primary-image"
              loading="lazy"
            />
            {secondaryImage && (
              <img
                src={secondaryImage}
                alt={`${product.name || "Product"} alternate angle`}
                className="product-image secondary-image"
                loading="lazy"
                aria-hidden="true"
              />
            )}
          </>
        ) : (
          <div className="product-image-placeholder">
            <span>🌸 Yamuna Store</span>
          </div>
        )}

        {/* Status & Merchandising Badges */}
        <div className="product-badges">
          {isOutOfStock && (
            <span className="product-badge badge-sold-out">Sold Out</span>
          )}
          {isNewCollection && !isOutOfStock && (
            <span className="product-badge badge-new">New Arrival</span>
          )}
          {isBestSeller && !isOutOfStock && (
            <span className="product-badge badge-bestseller">Best Seller</span>
          )}
        </div>

        {/* Quick Details Hover CTA */}
        <div className="product-card-cta" aria-hidden="true">
          <span>{isOutOfStock ? "View Item" : "View Details →"}</span>
        </div>
      </div>

      <div className="product-info">
        <div className="product-meta-row">
          {categoryName && (
            <p className="product-category">{categoryName}</p>
          )}
          {product.fabric && (
            <span className="product-fabric-tag">{product.fabric}</span>
          )}
        </div>

        <h3 className="product-name" title={product.name}>
          {product.name}
        </h3>

        {product.reviews_count !== undefined && product.reviews_count > 0 && (
          <div className="product-card-rating">
            <span className="card-stars">★★★★★</span>
            <span className="card-rating-num">{product.average_rating || "5.0"}</span>
            <span className="card-reviews-count">({product.reviews_count})</span>
          </div>
        )}

        <div className="product-price-row">
          <div className="product-price-group">
            <p className="product-price">
              {hasVaryingPrices && (
                <span className="price-from-label">From </span>
              )}
              {priceInfo.formatted}
            </p>
            {priceInfo.isConverted && (
              <span className="product-original-inr">
                ({hasVaryingPrices ? "From " : ""}
                {priceInfo.originalInr})
              </span>
            )}
          </div>
          {isOutOfStock ? (
            <span className="product-stock-tag out">Out of Stock</span>
          ) : (
            <span className="product-tax-label">Tax Incl.</span>
          )}
        </div>
      </div>
    </article>
  );
}

export default ProductCard;