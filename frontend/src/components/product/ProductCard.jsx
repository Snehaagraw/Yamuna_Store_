
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

  const isColorOutOfStock = (colorName) => {
    if (!product.color_inventory || !colorName) return false;
    const inv = product.color_inventory;
    const key = Object.keys(inv).find(
      (k) => k.trim().toLowerCase() === colorName.trim().toLowerCase()
    );
    if (!key) return false;
    const val = inv[key];
    if (val === undefined || val === null) return false;
    if (typeof val === "boolean") return !val;
    if (typeof val === "number") return val <= 0;
    const s = String(val).trim().toLowerCase();
    return s === "out of stock" || s === "sold out" || s === "0";
  };

  const hasColors = Boolean(product.colors && product.colors.length > 0);
  const allColorsOutOfStock =
    hasColors && product.colors.every((c) => isColorOutOfStock(c));

  const isOutOfStock =
    allColorsOutOfStock ||
    (!hasColors &&
      (product.stock_status === "Out of Stock" ||
        (typeof product.stock_status === "string" &&
          product.stock_status.toLowerCase().includes("out"))));

  const sizePricesList =
    product.size_prices && typeof product.size_prices === "object"
      ? Object.values(product.size_prices)
          .map(Number)
          .filter((p) => !isNaN(p) && p > 0)
      : [];

  const hasVaryingPrices =
    sizePricesList.length > 0 &&
    Math.min(...sizePricesList) !== Math.max(...sizePricesList);

  const rawBasePrice =
    hasVaryingPrices ? Math.min(...sizePricesList) : product.price;

  const rawOrigNum = product.original_price ? Number(product.original_price) : null;
  let discountPercent = Number(product.discount_percent) || 0;
  let finalSellingPrice = Number(rawBasePrice);
  let effectiveOriginalPrice = rawOrigNum;

  if (discountPercent > 0) {
    if (effectiveOriginalPrice && finalSellingPrice >= effectiveOriginalPrice) {
      finalSellingPrice = Math.round(effectiveOriginalPrice * (1 - discountPercent / 100));
    } else if (!effectiveOriginalPrice) {
      effectiveOriginalPrice = Math.round(finalSellingPrice / (1 - discountPercent / 100));
    }
  } else if (effectiveOriginalPrice && effectiveOriginalPrice > finalSellingPrice) {
    discountPercent = Math.round(((effectiveOriginalPrice - finalSellingPrice) / effectiveOriginalPrice) * 100);
  }

  const hasDiscount =
    (effectiveOriginalPrice !== null && effectiveOriginalPrice > finalSellingPrice) ||
    discountPercent > 0;

  const priceInfo = formatPrice(finalSellingPrice);
  const originalPriceInfo = effectiveOriginalPrice && hasDiscount
    ? formatPrice(effectiveOriginalPrice)
    : null;

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
          {product.discount_label && !isOutOfStock && (
            <span className="product-badge badge-special-offer" title={product.discount_label}>
              {product.discount_label}
            </span>
          )}
          {hasDiscount && !isOutOfStock && (
            <span className="product-badge badge-discount">{discountPercent}% OFF</span>
          )}
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

        {product.discount_label && (
          <div className="product-card-offer-pill" title={product.discount_label}>
            <span className="offer-pill-icon">🏷️</span>
            <span className="offer-pill-text">{product.discount_label}</span>
          </div>
        )}


        {product.reviews_count !== undefined && product.reviews_count > 0 && (
          <div className="product-card-rating">
            <span className="card-stars">★★★★★</span>
            <span className="card-rating-num">{product.average_rating || "5.0"}</span>
            <span className="card-reviews-count">({product.reviews_count})</span>
          </div>
        )}

        <div className="product-price-row">
          <div className="product-price-group">
            <div className="product-price-flex" style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
              <span className="product-price">
                {hasVaryingPrices && (
                  <span className="price-from-label">From </span>
                )}
                {priceInfo.formatted}
              </span>
              {hasDiscount && (
                <span
                  className="product-card-mrp"
                  title="Original Retail Price (MRP)"
                  style={{
                    fontSize: "13px",
                    color: "#6b7280",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                  }}
                >
                  MRP <span style={{ textDecoration: "line-through" }}>{originalPriceInfo.formatted}</span>
                </span>
              )}
            </div>
            {priceInfo.isConverted && (
              <span className="product-original-inr">
                ({hasVaryingPrices ? "From " : ""}
                {priceInfo.originalInr})
              </span>
            )}
          </div>
          {isOutOfStock ? (
            <span className="product-stock-tag out">Out of Stock</span>
          ) : hasDiscount ? (
            <span
              className="product-discount-chip"
              style={{
                fontSize: "10px",
                fontWeight: 700,
                color: "#15803d",
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                padding: "2px 6px",
                borderRadius: "4px",
                letterSpacing: "0.02em",
              }}
            >
              {discountPercent}% OFF
            </span>
          ) : (
            <span className="product-tax-label">Tax Incl.</span>
          )}
        </div>
      </div>
    </article>
  );
}

export default ProductCard;