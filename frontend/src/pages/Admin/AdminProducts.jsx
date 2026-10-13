import { useEffect, useRef, useState } from "react";
import api from "../../api/client";

import "./AdminProducts.css";

function ProductImageCarousel({ product }) {
  const images = product.images || [];

  const [currentIndex, setCurrentIndex] = useState(0);

  const carouselRef = useRef(null);

  useEffect(() => {
    setCurrentIndex(0);

    if (carouselRef.current) {
      carouselRef.current.scrollLeft = 0;
    }
  }, [images.length]);

  const scrollToImage = (index) => {
    if (!carouselRef.current || images.length === 0) {
      return;
    }

    const nextIndex = Math.max(
      0,
      Math.min(index, images.length - 1)
    );

    const width = carouselRef.current.clientWidth;

    carouselRef.current.scrollTo({
      left: width * nextIndex,
      behavior: "smooth",
    });

    setCurrentIndex(nextIndex);
  };

  const handleScroll = () => {
    if (
      !carouselRef.current ||
      images.length <= 1
    ) {
      return;
    }

    const width = carouselRef.current.clientWidth;

    if (width === 0) {
      return;
    }

    const index = Math.round(
      carouselRef.current.scrollLeft / width
    );

    setCurrentIndex(
      Math.max(
        0,
        Math.min(index, images.length - 1)
      )
    );
  };

  if (images.length === 0) {
    return (
      <div className="admin-product-image">
        <div className="admin-product-no-image">
          No Image
        </div>
      </div>
    );
  }

  return (
    <div className="admin-product-image-carousel">
      <div
        className="admin-product-image-track"
        ref={carouselRef}
        onScroll={handleScroll}
      >
        {images.map((image, index) => (
          <div
            className="admin-product-image-slide"
            key={image.id || index}
          >
            <img
              src={image.image}
              alt={`${product.name} ${index + 1}`}
              draggable="false"
            />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button
            type="button"
            className="admin-image-arrow admin-image-arrow-left"
            onClick={() =>
              scrollToImage(currentIndex - 1)
            }
            disabled={currentIndex === 0}
            aria-label="Previous image"
          >
            ‹
          </button>

          <button
            type="button"
            className="admin-image-arrow admin-image-arrow-right"
            onClick={() =>
              scrollToImage(currentIndex + 1)
            }
            disabled={
              currentIndex === images.length - 1
            }
            aria-label="Next image"
          >
            ›
          </button>

          <div className="admin-image-dots">
            {images.map((image, index) => (
              <button
                type="button"
                key={image.id || index}
                className={
                  index === currentIndex
                    ? "admin-image-dot active"
                    : "admin-image-dot"
                }
                onClick={() =>
                  scrollToImage(index)
                }
                aria-label={`Show image ${
                  index + 1
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function AdminProducts({
  onAddProduct,
  onEditProduct,
}) {
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [deletingProductId, setDeletingProductId] =
    useState(null);
  const [activeSectionFilter, setActiveSectionFilter] =
    useState("all");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/api/products/"
      );

      setProducts(response.data);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to load products. Please make sure the backend server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDeleteProduct = async (product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem(
      "admin_access_token"
    );

    if (!token) {
      setError(
        "Your admin session has expired. Please log in again."
      );
      return;
    }

    try {
      setDeletingProductId(product.id);
      setError("");

      await api.delete(
        `/api/products/${product.id}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProducts((previousProducts) =>
        previousProducts.filter(
          (item) => item.id !== product.id
        )
      );
    } catch (err) {
      console.error(err);

      if (err.response?.status === 401) {
        setError(
          "Your admin session has expired. Please log in again."
        );
      } else if (err.response?.data) {
        console.error(
          "Product deletion error:",
          err.response.data
        );

        setError(
          "Unable to delete the product. Please try again."
        );
      } else {
        setError(
          "Unable to connect to the server. Please try again."
        );
      }
    } finally {
      setDeletingProductId(null);
    }
  };

  return (
    <section className="admin-products-section">
      <div className="admin-products-top">
        <div className="admin-products-heading">
          <span>STORE MANAGEMENT</span>

          <h2>Products</h2>

          <p>
            Add, edit and manage your Yamuna Store
            products.
          </p>
        </div>

        <button
          type="button"
          className="admin-primary-button"
          onClick={onAddProduct}
        >
          + Add Product
        </button>
      </div>

      {!loading && !error && products.length > 0 && (
        <div className="admin-cat-section-tabs">
          <button
            type="button"
            className={`admin-cat-section-tab ${activeSectionFilter === "all" ? "active" : ""}`}
            onClick={() => setActiveSectionFilter("all")}
          >
            All Products ({products.length})
          </button>
          <button
            type="button"
            className={`admin-cat-section-tab ${activeSectionFilter === "women" ? "active" : ""}`}
            onClick={() => setActiveSectionFilter("women")}
          >
            Women's ({products.filter((p) => (p.section || "women") === "women").length})
          </button>
          <button
            type="button"
            className={`admin-cat-section-tab ${activeSectionFilter === "men" ? "active" : ""}`}
            onClick={() => setActiveSectionFilter("men")}
          >
            Men's ({products.filter((p) => p.section === "men").length})
          </button>
          <button
            type="button"
            className={`admin-cat-section-tab ${activeSectionFilter === "kids" ? "active" : ""}`}
            onClick={() => setActiveSectionFilter("kids")}
          >
            Kids' ({products.filter((p) => p.section === "kids").length})
          </button>
        </div>
      )}

      {loading && (
        <div className="admin-products-message">
          <p>Loading products...</p>
        </div>
      )}

      {error && (
        <div
          className="admin-products-error"
          role="alert"
        >
          <p>{error}</p>
        </div>
      )}

      {!loading &&
        !error &&
        products.length === 0 && (
          <div className="admin-products-empty">
            <h3>No products yet</h3>

            <p>
              Add your first Yamuna Store product
              to get started.
            </p>

            <button
              type="button"
              className="admin-primary-button"
              onClick={onAddProduct}
            >
              + Add Product
            </button>
          </div>
        )}

      {!loading &&
        !error &&
        products.length > 0 && (
          <div className="admin-products-grid">
            {products
              .filter((p) => {
                if (activeSectionFilter === "all") return true;
                return (p.section || "women") === activeSectionFilter;
              })
              .map((product) => {
                const sec = product.section || "women";
                return (
                  <article
                    className="admin-product-card"
                    key={product.id}
                  >
                    <ProductImageCarousel
                      product={product}
                    />

                    <div className="admin-product-info">
                      <div className="admin-product-category">
                        <span
                          className={`cat-section-pill section-${sec}`}
                          style={{
                            marginRight: "6px",
                            fontSize: "10px",
                            padding: "2px 8px",
                          }}
                        >
                          {sec === "men"
                            ? "Men"
                            : sec === "kids"
                            ? "Kids"
                            : "Women"}
                        </span>
                        {product.category}
                      </div>

                  <h3>{product.name}</h3>

                  <p className="admin-product-price">
                    ₹{product.price}
                  </p>

                  {product.description && (
                    <p className="admin-product-description">
                      {product.description}
                    </p>
                  )}

                  {product.fabric && (
                    <p className="admin-product-fabric">
                      <strong>Fabric:</strong>{" "}
                      {product.fabric}
                    </p>
                  )}

                  {product.weight && (
                    <p className="admin-product-fabric">
                      <strong>Weight:</strong>{" "}
                      {product.weight}
                    </p>
                  )}

                  {product.colors &&
                    product.colors.length > 0 && (
                      <div className="admin-product-colors">
                        <strong>Colors:</strong>

                        <div className="admin-product-color-list">
                          {product.colors.map(
                            (color, index) => (
                              <span
                                key={`${color}-${index}`}
                              >
                                {color}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {product.sizes &&
                    product.sizes.length > 0 && (
                      <div className="admin-product-sizes">
                        <strong>Sizes & Stock:</strong>

                        <div className="admin-product-size-list">
                          {product.sizes.map((size, index) => {
                            const stock =
                              product.size_inventory &&
                              product.size_inventory[size] !== undefined
                                ? Number(product.size_inventory[size])
                                : null;
                            const customPrice =
                              product.size_prices &&
                              product.size_prices[size] !== undefined &&
                              product.size_prices[size] !== ""
                                ? Number(product.size_prices[size])
                                : null;
                            const isSoldOut = stock !== null && stock <= 0;

                            return (
                              <span
                                key={`${size}-${index}`}
                                className={`admin-product-size-tag ${
                                  isSoldOut ? "sold-out" : ""
                                }`}
                                style={
                                  isSoldOut
                                    ? {
                                        background: "rgba(180, 40, 40, 0.1)",
                                        color: "#b02020",
                                        borderColor: "rgba(180, 40, 40, 0.3)",
                                      }
                                    : {}
                                }
                              >
                                {size}
                                {customPrice !== null ? ` · ₹${customPrice}` : ""}
                                {stock !== null ? ` (${stock} pcs)` : ""}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  <div className="admin-product-status">
                    <span
                      className={
                        product.stock_status ===
                        "In Stock"
                          ? "status-in-stock"
                          : "status-out-stock"
                      }
                    >
                      {product.stock_status}
                    </span>

                    {product.is_best_seller && (
                      <span className="product-tag">
                        Best Seller
                      </span>
                    )}

                    {product.is_new_collection && (
                      <span className="product-tag">
                        New
                      </span>
                    )}
                  </div>

                  <div className="admin-product-actions">
                    <button
                      type="button"
                      className="admin-edit-button"
                      onClick={() =>
                        onEditProduct(product)
                      }
                      disabled={
                        deletingProductId !== null
                      }
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="admin-delete-button"
                      onClick={() =>
                        handleDeleteProduct(product)
                      }
                      disabled={
                        deletingProductId ===
                        product.id
                      }
                    >
                      {deletingProductId ===
                      product.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
          </div>
        )}
    </section>
  );
}

export default AdminProducts;