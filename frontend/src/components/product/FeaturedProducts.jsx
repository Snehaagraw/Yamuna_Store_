import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function FeaturedProducts() {
  const [images, setImages] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchFeaturedImages = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/products/"
        );

        const featuredProducts = response.data.filter(
          (product) =>
            product.is_best_seller || product.is_new_collection
        );

        const uploadedImages = [];

        featuredProducts.forEach((product) => {
          if (!product.images) return;

          product.images.forEach((image) => {
            if (
              image.image &&
              !uploadedImages.some(
                (existingImage) => existingImage === image.image
              )
            ) {
              uploadedImages.push(image.image);
            }
          });
        });

        setImages(uploadedImages.slice(0, 5));
      } catch (error) {
        console.error(
          "Unable to load featured product images:",
          error
        );
      }
    };

    fetchFeaturedImages();
  }, []);

  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setActiveIndex(
        (current) => (current + 1) % images.length
      );
    }, 5000);

    return () => clearInterval(timer);
  }, [images.length]);

  const nextProduct = () => {
    if (images.length === 0) return;

    setActiveIndex(
      (current) => (current + 1) % images.length
    );
  };

  const previousProduct = () => {
    if (images.length === 0) return;

    setActiveIndex(
      (current) =>
        (current - 1 + images.length) % images.length
    );
  };

  if (images.length === 0) {
    return null;
  }

  const getImage = (offset) => {
    return images[
      (activeIndex + offset + images.length) %
        images.length
    ];
  };

  const previous = getImage(-1);
  const active = getImage(0);
  const next = getImage(1);

  return (
    <section className="featured-products-section">
      <div className="featured-products-background-circle" />

      <div className="featured-products-content">
        <h2>
          A little more
          <br />
          <span>meaning</span> in
          <br />
          what you wear.
        </h2>

        <p className="featured-products-description">
          We choose pieces that carry the spirit of
          tradition into everyday life — thoughtful,
          comfortable and made for moments of devotion.
        </p>

        <Link
          to="/collections"
          className="featured-products-button"
        >
          EXPLORE THE COLLECTION
          <span>→</span>
        </Link>
      </div>

      <div className="featured-products-showcase">
        <button
          type="button"
          className="featured-products-arrow featured-products-arrow-left"
          onClick={previousProduct}
          aria-label="Previous product"
        >
          ←
        </button>

        <div className="featured-product-card featured-product-card-back-left">
          <img
            src={previous}
            alt=""
          />
        </div>

        <div className="featured-product-card featured-product-card-main">
          <img
            src={active}
            alt=""
          />
        </div>

        <div className="featured-product-card featured-product-card-back-right">
          <img
            src={next}
            alt=""
          />
        </div>

        <button
          type="button"
          className="featured-products-arrow featured-products-arrow-right"
          onClick={nextProduct}
          aria-label="Next product"
        >
          →
        </button>

        <div className="featured-products-pagination">
          <span className="pagination-line" />

          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              className={`featured-pagination-dot ${
                index === activeIndex ? "active" : ""
              }`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Show featured image ${index + 1}`}
            />
          ))}

          <span className="pagination-line" />
        </div>
      </div>
    </section>
  );
}

export default FeaturedProducts;