import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import { useCart } from "../../context/CartContext";

import "./ProductDetails.css";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { addToCart, cartItems } = useCart();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          `http://127.0.0.1:8000/api/products/${id}/`
        );

        setProduct(response.data);
      } catch (err) {
        console.error(err);

        setError(
          "We couldn't find this product."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (!product) return;

    const alreadyInCart = cartItems.some(
      (item) => item.id === product.id
    );

    setAddedToCart(alreadyInCart);
  }, [product, cartItems]);

  const handleAddToCart = () => {
    if (!product || product.stock_status === "Out of Stock") {
      return;
    }

    addToCart(product);
    setAddedToCart(true);
  };

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="product-details-page">
          <div className="product-details-message">
            <p>Loading product...</p>
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
            <h2>Product not found</h2>

            <p>
              The product you're looking for is unavailable.
            </p>

            <button
              type="button"
              onClick={() => navigate("/collections")}
              className="product-details-back-button"
            >
              Back to Collection
            </button>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  const images = product.images || [];

  const selectedImageUrl =
    images[selectedImage]?.image || null;

  const isOutOfStock =
    product.stock_status === "Out of Stock";

  return (
    <>
      <Navbar />

      <main className="product-details-page">
        <section className="product-details-container">
          <button
            type="button"
            className="product-details-back"
            onClick={() => navigate("/collections")}
          >
            ← Back to Collection
          </button>

          <div className="product-details-layout">
            <div className="product-details-gallery">
              <div className="product-details-main-image">
                {selectedImageUrl ? (
                  <img
                    src={selectedImageUrl}
                    alt={product.name}
                  />
                ) : (
                  <div className="product-details-no-image">
                    Product Image
                  </div>
                )}

                <div className="product-details-badges">
                  {product.is_new_collection && (
                    <span>New</span>
                  )}

                  {product.is_best_seller && (
                    <span>Best Seller</span>
                  )}
                </div>
              </div>

              {images.length > 1 && (
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
                    >
                      <img
                        src={image.image}
                        alt={`${product.name} ${index + 1}`}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="product-details-info">
              <p className="product-details-category">
                {product.category}
              </p>

              <h1>{product.name}</h1>

              <p className="product-details-price">
                ₹{Number(product.price).toLocaleString("en-IN")}
              </p>

              <div className="product-details-divider" />

              {product.description && (
                <div className="product-details-description">
                  <h3>Description</h3>
                  <p>{product.description}</p>
                </div>
              )}

              {product.fabric && (
                <div className="product-details-property">
                  <span>Fabric</span>
                  <strong>{product.fabric}</strong>
                </div>
              )}

              {product.colors?.length > 0 && (
                <div className="product-details-property product-details-colors">
                  <span>Available Colors</span>

                  <div className="product-color-list">
                    {product.colors.map((color, index) => (
                      <span key={`${color}-${index}`}>
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="product-details-stock">
                <span
                  className={
                    isOutOfStock
                      ? "stock-indicator out"
                      : "stock-indicator"
                  }
                />

                {isOutOfStock
                  ? "Out of Stock"
                  : "In Stock"}
              </div>

              <button
                type="button"
                className="product-add-cart-button"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
              >
                {isOutOfStock
                  ? "Out of Stock"
                  : addedToCart
                    ? "Added to Cart ✓"
                    : "Add to Cart"}
              </button>

              <p className="product-details-note">
                Add this piece to your cart and continue
                shopping, or proceed to checkout when ready.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default ProductDetails;