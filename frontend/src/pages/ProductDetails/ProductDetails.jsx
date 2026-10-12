import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../../api/client";

import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import { useCart } from "../../context/CartContext";
import { useCurrency } from "../../context/CurrencyContext";
import ProductImageZoom from "../../components/product/ProductImageZoom";

import "./ProductDetails.css";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { addToCart, cartItems } = useCart();
  const { formatPrice, selectedCurrency } = useCurrency();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  const addedToCart = useMemo(() => {
    if (!product) return false;
    return cartItems.some(
      (item) =>
        item.id === product.id &&
        (item.size || "") === (selectedSize || "")
    );
  }, [product, cartItems, selectedSize]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/api/products/${id}/`);
        setProduct(response.data);
      } catch (err) {
        console.error("Failed to load product details:", err);
        setError("We couldn't find this product.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product?.sizes && product.sizes.length > 0) {
      // Pick first size that is in-stock, or fallback to first size
      const availableSize =
        product.sizes.find(
          (s) =>
            !(
              product.size_inventory &&
              product.size_inventory[s] !== undefined &&
              Number(product.size_inventory[s]) <= 0
            )
        ) || product.sizes[0];
      setSelectedSize(availableSize);
    } else {
      setSelectedSize("");
    }
  }, [product]);

  const currentCartItem = cartItems.find(
    (item) =>
      item.id === product?.id &&
      (item.size || "") === (selectedSize || "")
  );
  const cartQuantity = currentCartItem ? currentCartItem.quantity : 0;

  const selectedSizeStock =
    product?.size_inventory && selectedSize
      ? product.size_inventory[selectedSize]
      : undefined;

  const isSelectedSizeOutOfStock =
    selectedSizeStock !== undefined && Number(selectedSizeStock) <= 0;

  const isOutOfStock =
    !product ||
    product.stock_status === "Out of Stock" ||
    isSelectedSizeOutOfStock;

  const maxAllowedStock =
    selectedSizeStock !== undefined ? Number(selectedSizeStock) : 99;

  const isMaxStockReached =
    !isOutOfStock &&
    selectedSizeStock !== undefined &&
    cartQuantity >= Number(selectedSizeStock);

  const remainingAvailableStock = Math.max(0, maxAllowedStock - cartQuantity);

  const handleAddToCart = () => {
    if (!product || isOutOfStock || isMaxStockReached) {
      return;
    }

    addToCart(product, selectedSize, quantity);
  };

  const activePrice = useMemo(() => {
    if (!product) return 0;
    if (
      selectedSize &&
      product.size_prices &&
      product.size_prices[selectedSize] !== undefined &&
      product.size_prices[selectedSize] !== "" &&
      !isNaN(Number(product.size_prices[selectedSize]))
    ) {
      return Number(product.size_prices[selectedSize]);
    }
    return Number(product.price || 0);
  }, [product, selectedSize]);

  const hasMultipleSizePrices = useMemo(() => {
    if (!product?.sizes || !product?.size_prices) return false;
    const prices = Object.values(product.size_prices)
      .map(Number)
      .filter((p) => !isNaN(p) && p > 0);
    return new Set(prices).size > 1;
  }, [product]);

  const priceInfo = formatPrice(activePrice);

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="product-details-page">
          <div className="product-details-message">
            <div className="product-details-spinner">🌸</div>
            <p>Loading sacred attire from Vrindavan...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Navbar />
        <main className="product-details-page">
          <div className="product-details-message">
            <h2>Product Not Found</h2>
            <p>The sacred garment you're looking for is unavailable.</p>
            <button
              type="button"
              onClick={() => navigate("/collections")}
              className="product-details-back-button"
            >
              Explore Collection
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const images = product.images || [];
  const selectedImageUrl = images[selectedImage]?.image || null;

  return (
    <>
      <Navbar />

      <main className="product-details-page">
        <section className="product-details-container">
          {/* Breadcrumb Navigation */}
          <nav className="product-breadcrumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span className="crumb-sep">›</span>
            <Link to="/collections">Collections</Link>
            {product.category && (
              <>
                <span className="crumb-sep">›</span>
                <Link
                  to={`/collections?category=${encodeURIComponent(
                    product.category
                  )}`}
                >
                  {product.category}
                </Link>
              </>
            )}
            <span className="crumb-sep">›</span>
            <span className="crumb-current">{product.name}</span>
          </nav>

          <div className="product-details-layout">
            {/* LEFT COLUMN: Gallery with Magnifying Glass Zoom */}
            <div className="product-details-gallery">
              <ProductImageZoom
                src={selectedImageUrl}
                alt={product.name}
                zoomScale={2.5}
                badges={
                  (product.is_new_collection || product.is_best_seller) && (
                    <div className="product-details-badges">
                      {product.is_new_collection && <span>New Collection</span>}
                      {product.is_best_seller && <span>Best Seller</span>}
                    </div>
                  )
                }
              />

              {/* Thumbnails Row */}
              {images.length > 1 && (
                <div className="product-details-thumbnails-wrapper">
                  <div className="product-details-thumbnails">
                    {images.map((image, index) => (
                      <button
                        type="button"
                        key={image.id || index}
                        className={
                          selectedImage === index
                            ? "product-thumbnail active"
                            : "product-thumbnail"
                        }
                        onClick={() => setSelectedImage(index)}
                        aria-label={`View photo ${index + 1}`}
                      >
                        <img
                          src={image.image}
                          alt={`${product.name} view ${index + 1}`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="thumbnails-counter">
                    Photo {selectedImage + 1} of {images.length}
                  </span>
                </div>
              )}

              {/* Gallery Trust Highlights */}
              <div className="gallery-trust-strip">
                <div className="gallery-trust-item">
                  <span className="gallery-trust-icon">🌸</span>
                  <span>Handcrafted in Vrindavan Dham</span>
                </div>
                <div className="gallery-trust-item">
                  <span className="gallery-trust-icon">✨</span>
                  <span>100% Temple-Grade Pure Fabrics</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Product Information & Buying Options */}
            <div className="product-details-info">
              {/* Category Eyebrow & Stock Pill */}
              <div className="product-meta-header">
                <span className="product-category-eyebrow">
                  VRINDAVAN DHAM · {product.category || "DEVOTIONAL WEAR"}
                </span>

                <span
                  className={`product-stock-pill ${
                    isOutOfStock ? "out-of-stock" : "in-stock"
                  }`}
                >
                  <span className="stock-dot" />
                  {isOutOfStock
                    ? "Out of Stock"
                    : selectedSizeStock !== undefined && selectedSizeStock <= 5
                    ? `Only ${selectedSizeStock} Left!`
                    : "In Stock · Ready to Dispatch"}
                </span>
              </div>

              {/* Product Title */}
              <h1 className="product-main-title">{product.name}</h1>

              {/* Price Area */}
              <div className="product-price-container">
                {priceInfo.isConverted ? (
                  <div className="product-converted-price-block">
                    <div className="converted-main-row">
                      <span className="product-price-amount">
                        {priceInfo.formatted}
                      </span>
                      <span className="product-currency-badge">
                        {selectedCurrency.flag} {selectedCurrency.code}
                      </span>
                      {hasMultipleSizePrices && selectedSize && (
                        <span className="product-size-price-tag">
                          Size: {selectedSize}
                        </span>
                      )}
                    </div>
                    <div className="product-inr-reference-row">
                      <span>Approx. conversion · Charged in INR:</span>
                      <strong>{priceInfo.originalInr}</strong>
                    </div>
                  </div>
                ) : (
                  <div className="product-standard-price-row">
                    <span className="product-currency-symbol">₹</span>
                    <span className="product-price-amount">
                      {Number(activePrice).toLocaleString("en-IN")}
                    </span>
                    {hasMultipleSizePrices && selectedSize && (
                      <span className="product-size-price-tag">
                        Size: {selectedSize}
                      </span>
                    )}
                  </div>
                )}
                <span className="product-tax-text">
                  Inclusive of all taxes
                </span>
              </div>

              {/* Quick Specs Highlight Bar (Only for real attributes entered by admin) */}
              {(product.fabric || product.weight || product.origin || product.occasion) && (
                <div className="product-quick-specs-grid">
                  {product.fabric && (
                    <div className="spec-card">
                      <span className="spec-label">Fabric</span>
                      <strong className="spec-value">🪡 {product.fabric}</strong>
                    </div>
                  )}

                  {product.weight && (
                    <div className="spec-card">
                      <span className="spec-label">Weight</span>
                      <strong className="spec-value">⚖️ {product.weight}</strong>
                    </div>
                  )}

                  {product.origin && (
                    <div className="spec-card">
                      <span className="spec-label">Origin</span>
                      <strong className="spec-value">📍 {product.origin}</strong>
                    </div>
                  )}

                  {product.occasion && (
                    <div className="spec-card">
                      <span className="spec-label">Occasion</span>
                      <strong className="spec-value">🌸 {product.occasion}</strong>
                    </div>
                  )}
                </div>
              )}

              <div className="product-details-divider" />

              {/* Colors Display (Static Informational Tags) */}
              {product.colors?.length > 0 && (
                <div className="product-option-block">
                  <div className="option-label-row">
                    <span className="option-title">Featured Colors</span>
                  </div>

                  <div className="product-color-tags">
                    {product.colors.map((color, index) => (
                      <span
                        key={`${color}-${index}`}
                        className="color-static-tag"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product.sizes?.length > 0 && (
                <div className="product-option-block">
                  <div className="option-label-row">
                    <span className="option-title">Select Size</span>
                    {selectedSizeStock !== undefined && (
                      <span
                        className={`size-stock-hint ${
                          selectedSizeStock <= 5 ? "urgent" : ""
                        }`}
                      >
                        {Number(selectedSizeStock) <= 0
                          ? "Size Sold Out"
                          : Number(selectedSizeStock) <= 5
                          ? `⚡ Only ${selectedSizeStock} pieces left in ${selectedSize}`
                          : `${selectedSizeStock} available in size ${selectedSize}`}
                      </span>
                    )}
                  </div>

                  <div className="product-size-buttons">
                    {product.sizes.map((size) => {
                      const isSoldOut =
                        product.size_inventory &&
                        product.size_inventory[size] !== undefined &&
                        Number(product.size_inventory[size]) <= 0;

                      const customSizePrice =
                        product.size_prices &&
                        product.size_prices[size] !== undefined &&
                        product.size_prices[size] !== ""
                          ? Number(product.size_prices[size])
                          : null;

                      const showCustomPrice =
                        hasMultipleSizePrices &&
                        customSizePrice !== null &&
                        customSizePrice > 0;

                      return (
                        <button
                          key={size}
                          type="button"
                          className={`product-size-btn ${
                            selectedSize === size ? "active" : ""
                          } ${isSoldOut ? "sold-out" : ""} ${
                            showCustomPrice ? "has-custom-price" : ""
                          }`}
                          onClick={() => {
                            setSelectedSize(size);
                            setQuantity(1);
                          }}
                          disabled={isSoldOut}
                          title={
                            isSoldOut
                              ? `${size} (Sold Out)`
                              : showCustomPrice
                              ? `Select size ${size} - ${formatPrice(customSizePrice).formatted}`
                              : `Select size ${size}`
                          }
                        >
                          <span className="size-btn-label">{size}</span>
                          {showCustomPrice && (
                            <span className="size-btn-price-chip">
                              {formatPrice(customSizePrice).formatted}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Stepper & Add to Cart Action */}
              <div className="product-actions-block">
                <div className="product-quantity-stepper">
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="stepper-value">{quantity}</span>
                  <button
                    type="button"
                    className="stepper-btn"
                    onClick={() =>
                      setQuantity((q) =>
                        Math.min(remainingAvailableStock || 10, q + 1)
                      )
                    }
                    disabled={
                      quantity >= (remainingAvailableStock || 10) ||
                      isOutOfStock ||
                      isMaxStockReached
                    }
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  className="product-add-cart-button"
                  disabled={isOutOfStock || isMaxStockReached}
                  onClick={handleAddToCart}
                >
                  {isOutOfStock
                    ? "Out of Stock"
                    : isMaxStockReached
                    ? `All in Cart (${cartQuantity}) ✓`
                    : addedToCart
                    ? "Added to Cart ✓"
                    : "Add to Cart"}
                </button>
              </div>

              {/* Added to Cart Feedback Banner */}
              {addedToCart && (
                <div className="product-added-banner">
                  <div className="added-banner-text">
                    <span>✓</span>
                    <span>Item added to your devotional cart</span>
                  </div>
                  <button
                    type="button"
                    className="added-banner-cart-btn"
                    onClick={() => navigate("/cart")}
                  >
                    View Cart ({cartQuantity}) →
                  </button>
                </div>
              )}

              {/* Sacred Vrindavan Trust Guarantees */}
              <div className="product-trust-grid">
                <div className="trust-card">
                  <span className="trust-icon">🌸</span>
                  <div className="trust-info">
                    <strong>Sacred Crafting</strong>
                    <p>Woven with purity and devotion in Sri Vrindavan Dham.</p>
                  </div>
                </div>

                <div className="trust-card">
                  <span className="trust-icon">📦</span>
                  <div className="trust-info">
                    <strong>Worldwide Shipping</strong>
                    <p>Carefully dispatched across India & all international destinations.</p>
                  </div>
                </div>

                <div className="trust-card">
                  <span className="trust-icon">⚖️</span>
                  <div className="trust-info">
                    <strong>Weight-Based Shipping</strong>
                    <p>Transparent rates accurately calculated by parcel weight at checkout.</p>
                  </div>
                </div>

                <div className="trust-card">
                  <span className="trust-icon">✨</span>
                  <div className="trust-info">
                    <strong>Devotee Care</strong>
                    <p>Dedicated size support and WhatsApp assistance for your order.</p>
                  </div>
                </div>
              </div>

              {/* Information Tabs (Description / Fabric & Care / Shipping) */}
              <div className="product-tabs-wrapper">
                <div className="product-tabs-header">
                  <button
                    type="button"
                    className={`tab-header-btn ${
                      activeTab === "description" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("description")}
                  >
                    Description
                  </button>
                  <button
                    type="button"
                    className={`tab-header-btn ${
                      activeTab === "details" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("details")}
                  >
                    Fabric & Care
                  </button>
                  <button
                    type="button"
                    className={`tab-header-btn ${
                      activeTab === "shipping" ? "active" : ""
                    }`}
                    onClick={() => setActiveTab("shipping")}
                  >
                    Shipping & Delivery
                  </button>
                </div>

                <div className="product-tabs-body">
                  {activeTab === "description" && (
                    <div className="tab-pane-content">
                      <p>
                        {product.description ||
                          "Thoughtfully created for darshan, temple visits, festive celebrations, and devotional contemplation."}
                      </p>
                    </div>
                  )}

                  {activeTab === "details" && (
                    <div className="tab-pane-content">
                      <div className="tab-specs-list">
                        {product.fabric && (
                          <div className="tab-spec-row">
                            <span>Material Fabric</span>
                            <strong>{product.fabric}</strong>
                          </div>
                        )}
                        {product.weight && (
                          <div className="tab-spec-row">
                            <span>Approx. Weight</span>
                            <strong>{product.weight}</strong>
                          </div>
                        )}
                        <div className="tab-spec-row">
                          <span>Wash & Care</span>
                          <strong>Gentle hand wash or gentle dry clean. Shade dry to protect colors.</strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "shipping" && (
                    <div className="tab-pane-content">
                      <div className="tab-specs-list">
                        <div className="tab-spec-row">
                          <span>Pan-India Dispatch</span>
                          <strong>Delivered in 3–5 business days via reliable express couriers.</strong>
                        </div>
                        <div className="tab-spec-row">
                          <span>International Delivery</span>
                          <strong>Worldwide delivery in 7–12 business days with end-to-end tracking.</strong>
                        </div>
                        <div className="tab-spec-row">
                          <span>Shipping Calculation</span>
                          <strong>Shipping costs are transparently calculated at checkout based on total weight.</strong>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default ProductDetails;
