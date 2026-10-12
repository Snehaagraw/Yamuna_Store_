import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/client";
import { useCurrency } from "../../context/CurrencyContext";

import collectionCover1 from "../../assets/images/collectionCover1.png";
import collectionCover2 from "../../assets/images/collectionCover2.png";
import collectionCover3 from "../../assets/images/collectionCover3.png";
import collectionCover4 from "../../assets/images/collectionCover4.png";
import collectionCover5 from "../../assets/images/collectionCover5.png";

const CURATED_FALLBACK_PRODUCTS = [
  {
    id: null,
    name: "Sri Radharani Chanderi Gopi Dress",
    categoryName: "Gopi Dress",
    price: 2499,
    image: collectionCover1,
    badge: "Best Seller",
  },
  {
    id: null,
    name: "Banarasi Temple Border Silk Saree",
    categoryName: "Sarees",
    price: 3200,
    image: collectionCover2,
    badge: "New Arrival",
  },
  {
    id: null,
    name: "Pure Handloom Ahimsa Dhoti Kurta",
    categoryName: "Dhoti Kurta",
    price: 1850,
    image: collectionCover5,
    badge: "Sacred Classic",
  },
  {
    id: null,
    name: "Vrindavan Kanthi Floral Kurti",
    categoryName: "Kurties",
    price: 1250,
    image: collectionCover3,
    badge: "Devotee Favorite",
  },
  {
    id: null,
    name: "Sacred Kadambari Dupatta Ensemble",
    categoryName: "Dupattas",
    price: 950,
    image: collectionCover4,
    badge: "Pure Cotton",
  },
];

function FeaturedProducts() {
  const [products, setProducts] = useState(CURATED_FALLBACK_PRODUCTS);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchFeaturedProducts = async () => {
      try {
        const response = await api.get("/api/products/");
        if (!isMounted) return;

        if (
          response.data &&
          Array.isArray(response.data) &&
          response.data.length > 0
        ) {
          const apiProducts = response.data
            .map((p) => {
              const img =
                p.images?.[0]?.image ||
                p.image ||
                (Array.isArray(p.images) && typeof p.images[0] === "string"
                  ? p.images[0]
                  : null);

              const catName =
                typeof p.category === "string"
                  ? p.category
                  : p.category_details?.name ||
                    p.category?.name ||
                    "Sacred Attire";

              const badge = p.is_best_seller
                ? "Best Seller"
                : p.is_new_collection
                ? "New Arrival"
                : "Sacred Vrindavan";

              return {
                id: p.id,
                name: p.name,
                categoryName: catName,
                price: Number(p.price) || 0,
                image: img,
                badge,
                is_best_seller: p.is_best_seller,
                is_new_collection: p.is_new_collection,
              };
            })
            .filter((p) => Boolean(p.image));

          let featuredList = apiProducts.filter(
            (p) => p.is_best_seller || p.is_new_collection
          );

          if (featuredList.length < 3) {
            const nonFeatured = apiProducts.filter(
              (p) => !featuredList.some((f) => f.id === p.id)
            );
            featuredList = [...featuredList, ...nonFeatured];
          }

          if (featuredList.length < 3) {
            const fallbackPadding = CURATED_FALLBACK_PRODUCTS.filter(
              (fb) =>
                !featuredList.some(
                  (f) =>
                    f.name.toLowerCase().trim() ===
                    fb.name.toLowerCase().trim()
                )
            );
            featuredList = [...featuredList, ...fallbackPadding];
          }

          if (featuredList.length > 0) {
            setProducts(featuredList.slice(0, 6));
          }
        }
      } catch (error) {
        console.error("Unable to load featured products:", error);
      }
    };

    fetchFeaturedProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  const nextProduct = useCallback(() => {
    if (products.length === 0) return;
    setActiveIndex((current) => (current + 1) % products.length);
  }, [products.length]);

  const previousProduct = useCallback(() => {
    if (products.length === 0) return;
    setActiveIndex(
      (current) => (current - 1 + products.length) % products.length
    );
  }, [products.length]);

  useEffect(() => {
    if (products.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % products.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [products.length, isPaused]);

  if (products.length === 0) {
    return null;
  }

  const getProduct = (offset) => {
    return products[
      (activeIndex + offset + products.length) % products.length
    ];
  };

  const previous = getProduct(-1);
  const active = getProduct(0);
  const next = getProduct(1);

  const handleCardClick = (product) => {
    if (product.id) {
      navigate(`/product/${product.id}`);
    } else {
      navigate("/collections");
    }
  };

  return (
    <section
      className="featured-products-section"
      aria-label="Featured Sacred Vrindavan Attire"
    >
      <div className="featured-products-background-circle" />

      <div className="featured-products-content">
        <p className="featured-products-eyebrow">
          ॥ श्री राधेश्याम ॥ · CURATED SPOTLIGHT
        </p>

        <h2>
          A little more
          <br />
          <span>meaning</span> in
          <br />
          what you wear.
        </h2>

        <p className="featured-products-description">
          We handcraft and select pieces that carry the spirit of
          Vrindavan into everyday life — pure, comfortable and consecrated
          for moments of devotion, darshan, and temple seva.
        </p>

        <Link
          to="/collections"
          className="featured-products-button"
        >
          EXPLORE THE COLLECTION
          <span>→</span>
        </Link>
      </div>

      <div
        className="featured-products-showcase"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <button
          type="button"
          className="featured-products-arrow featured-products-arrow-left"
          onClick={previousProduct}
          aria-label="Previous featured creation"
        >
          ←
        </button>

        {previous && (
          <div
            className="featured-product-card featured-product-card-back-left"
            onClick={previousProduct}
            role="button"
            tabIndex={0}
            title={`Switch to: ${previous.name}`}
            aria-label={`Previous creation: ${previous.name}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                previousProduct();
              }
            }}
          >
            <img src={previous.image} alt={previous.name} />
            <div className="featured-side-card-overlay">
              <span>← {previous.name}</span>
            </div>
          </div>
        )}

        {active && (
          <div
            className="featured-product-card featured-product-card-main"
            onClick={() => handleCardClick(active)}
            role="button"
            tabIndex={0}
            aria-label={`View ${active.name}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleCardClick(active);
              }
            }}
          >
            <img src={active.image} alt={active.name} />

            {active.badge && (
              <span className="featured-product-badge">{active.badge}</span>
            )}

            <div className="featured-product-info">
              <p>{active.categoryName}</p>
              <h3>{active.name}</h3>
              <div className="featured-product-bottom-row">
                <span className="featured-product-price">
                  {formatPrice(active.price).formatted}
                </span>
                <span className="featured-product-cta-text">
                  View Details →
                </span>
              </div>
            </div>
          </div>
        )}

        {next && (
          <div
            className="featured-product-card featured-product-card-back-right"
            onClick={nextProduct}
            role="button"
            tabIndex={0}
            title={`Switch to: ${next.name}`}
            aria-label={`Next creation: ${next.name}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                nextProduct();
              }
            }}
          >
            <img src={next.image} alt={next.name} />
            <div className="featured-side-card-overlay">
              <span>{next.name} →</span>
            </div>
          </div>
        )}

        <button
          type="button"
          className="featured-products-arrow featured-products-arrow-right"
          onClick={nextProduct}
          aria-label="Next featured creation"
        >
          →
        </button>

        <div className="featured-products-pagination">
          <span className="pagination-line" />

          {products.map((item, index) => (
            <button
              key={`${item.name}-${index}`}
              type="button"
              className={`featured-pagination-dot ${
                index === activeIndex ? "active" : ""
              }`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Show featured creation ${index + 1}: ${item.name}`}
            />
          ))}

          <span className="pagination-line" />
        </div>
      </div>
    </section>
  );
}

export default FeaturedProducts;