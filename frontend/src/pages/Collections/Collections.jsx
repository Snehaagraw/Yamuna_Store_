import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import ProductGrid from "../../components/product/ProductGrid";

import "./Collections.css";

const categories = [
  "All Pieces",
  "Gopi Dress",
  "Sarees",
  "Kurties",
  "Dupattas",
  "Dhoti Kurta",
];

function Collections() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const categoryFromUrl = searchParams.get("category");

  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState(
    categories.includes(categoryFromUrl)
      ? categoryFromUrl
      : "All Pieces"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("Featured");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (categories.includes(categoryFromUrl)) {
      setActiveCategory(categoryFromUrl);
    } else {
      setActiveCategory("All Pieces");
    }
  }, [categoryFromUrl]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          "http://127.0.0.1:8000/api/products/"
        );

        setProducts(response.data);
      } catch (err) {
        console.error(err);
        setError(
          "Unable to load the collection. Please make sure the backend server is running."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (activeCategory !== "All Pieces") {
      result = result.filter(
        (product) => product.category === activeCategory
      );
    }

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();

      result = result.filter(
        (product) =>
          product.name?.toLowerCase().includes(search) ||
          product.category?.toLowerCase().includes(search) ||
          product.description?.toLowerCase().includes(search)
      );
    }

    if (sortBy === "Featured") {
      result.sort((a, b) => {
        const aFeatured =
          (a.is_new_collection ? 2 : 0) +
          (a.is_best_seller ? 1 : 0);

        const bFeatured =
          (b.is_new_collection ? 2 : 0) +
          (b.is_best_seller ? 1 : 0);

        return bFeatured - aFeatured;
      });
    }

    if (sortBy === "Newest") {
      result.sort(
        (a, b) =>
          new Date(b.created_at || 0) -
          new Date(a.created_at || 0)
      );
    }

    if (sortBy === "Price: Low to High") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    }

    if (sortBy === "Price: High to Low") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    }

    return result;
  }, [products, activeCategory, searchTerm, sortBy]);

  return (
    <>
      <Navbar />

      <main className="collections-page">
        <section className="collections-hero">
          <div className="collections-hero-inner">
            <span className="collections-eyebrow">
              THE COMPLETE COLLECTION
            </span>

            <h1>
              Wear your
              <br />
              <em>tradition.</em>
            </h1>

            <p>
              Thoughtful layers for darshan, celebration and all
              the beautiful ordinary days in between.
            </p>
          </div>
        </section>

        <section className="collections-content">
          <div className="collections-toolbar">
            <div className="collection-categories">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={
                    activeCategory === category
                      ? "collection-category active"
                      : "collection-category"
                  }
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="collection-controls">
              <div className="collection-search">
                <input
                  type="search"
                  placeholder="Search collection"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                  aria-label="Search collection"
                />
              </div>

              <div className="collection-sort">
                <select
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(event.target.value)
                  }
                  aria-label="Sort products"
                >
                  <option value="Featured">Featured</option>
                  <option value="Newest">Newest</option>
                  <option value="Price: Low to High">
                    Price: Low to High
                  </option>
                  <option value="Price: High to Low">
                    Price: High to Low
                  </option>
                </select>
              </div>
            </div>
          </div>

          <div className="collections-results-heading">
            <span>
              {loading
                ? "Loading collection..."
                : `${filteredProducts.length} ${
                    filteredProducts.length === 1
                      ? "piece"
                      : "pieces"
                  }`}
            </span>
          </div>

          {loading && (
            <div className="collections-message">
              <p>Loading our collection...</p>
            </div>
          )}

          {error && !loading && (
            <div className="collections-message collections-error">
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && (
            <ProductGrid
              products={filteredProducts}
              onProductClick={(product) =>
                navigate(`/product/${product.id}`)
              }
            />
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Collections;