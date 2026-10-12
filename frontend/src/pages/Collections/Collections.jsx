import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/client";

import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import ProductGrid from "../../components/product/ProductGrid";

import "./Collections.css";

const SUBSECTIONS = [
  { key: "all", label: "All Creations", icon: "✨", tag: "Complete Catalog" },
  { key: "women", label: "Women's Attire", icon: "🌸", tag: "Gopi Dresses, Sarees, Kurtis" },
  { key: "men", label: "Men's Attire", icon: "🪔", tag: "Dhoti Kurtas & Vedic Sets" },
  { key: "kids", label: "Kids' Attire", icon: "🌟", tag: "Little Devotees" },
];

const HERO_CONTENT = {
  all: {
    eyebrow: "॥ श्री राधेश्याम ॥ · SACRED VRINDAVAN WARDROBE",
    title: (
      <>
        Wear Your
        <br />
        <em>Devotion.</em>
      </>
    ),
    subtitle:
      "Handcrafted deity poshaks, festive Gopi skirts, dhoti kurtas, and devotional ensembles tailored with spiritual sanctity in Sri Vrindavan Dham.",
  },
  women: {
    eyebrow: "॥ श्री राधावल्लभ ॥ · SACRED WOMEN'S COLLECTION",
    title: (
      <>
        Devotional Grace
        <br />
        <em>& Holy Purity.</em>
      </>
    ),
    subtitle:
      "Handcrafted Gopi dresses, traditional silk sarees, flowy dupattas, and elegant kurtis consecrated in the sacred land of Sri Vrindavan Dham.",
  },
  men: {
    eyebrow: "॥ श्री गिरिराज धरण ॥ · SACRED MEN'S COLLECTION",
    title: (
      <>
        Traditional Dhoti
        <br />
        <em>Kurtas & Sets.</em>
      </>
    ),
    subtitle:
      "Pure handloom cotton & ceremonial silk dhoti kurtas tailored for temple darshan, parikrama, kirtan gatherings, and sacred festivities.",
  },
  kids: {
    eyebrow: "॥ नन्द नन्दन ॥ · SACRED KIDS' COLLECTION",
    title: (
      <>
        Adorn The Little
        <br />
        <em>Devotees of Kanha.</em>
      </>
    ),
    subtitle:
      "Comfortable, breathable, and auspicious traditional attire thoughtfully crafted for holy festivals, temple visits, and family ceremonies.",
  },
};

const DEFAULT_CATEGORIES = [
  { id: 1, name: "Gopi Dress", section: "women" },
  { id: 2, name: "Sarees", section: "women" },
  { id: 3, name: "Kurties", section: "women" },
  { id: 4, name: "Dupattas", section: "women" },
  { id: 5, name: "Dhoti Kurta", section: "men" },
  { id: 6, name: "Kids Dhoti Kurta", section: "kids" },
  { id: 7, name: "Kids Gopi Dress", section: "kids" },
  { id: 8, name: "Kids Kurta", section: "kids" },
];

const PAGE_SIZE = 12;

const normalizeText = (text) =>
  String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[-_]/g, " ");

const isCategoryMatch = (product, targetCategory) => {
  if (!targetCategory || targetCategory === "All" || targetCategory.startsWith("All")) {
    return true;
  }
  const target = normalizeText(targetCategory);
  if (target === "all" || target === "all pieces") return true;

  const prodCat = normalizeText(product.category);
  const prodCatName = normalizeText(product.category_details?.name);
  const prodCatSlug = normalizeText(product.category_details?.slug);

  return (
    prodCat === target ||
    prodCatName === target ||
    prodCatSlug === target
  );
};

const getProductSection = (product) => {
  return (
    product.section ||
    product.category_details?.section ||
    "women"
  ).toLowerCase();
};

function Collections() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL params
  const rawSectionParam = searchParams.get("section")?.toLowerCase();
  const initialSection = ["women", "men", "kids"].includes(rawSectionParam)
    ? rawSectionParam
    : "all";

  const rawCategoryParam = searchParams.get("category");

  const [activeSection, setActiveSection] = useState(initialSection);
  const [activeCategory, setActiveCategory] = useState(rawCategoryParam || "All");
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("Featured");
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [gridColumns, setGridColumns] = useState(3);

  // Sync state if URL search params change externally (e.g. Navbar click)
  useEffect(() => {
    const secParam = searchParams.get("section")?.toLowerCase();
    if (["women", "men", "kids"].includes(secParam)) {
      setActiveSection(secParam);
    } else {
      setActiveSection("all");
    }

    const catParam = searchParams.get("category");
    if (catParam) {
      setActiveCategory(catParam);
    } else {
      setActiveCategory("All");
    }
  }, [searchParams]);

  // Reset pagination when any filter changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeSection, activeCategory, searchTerm, sortBy, onlyInStock]);

  // Fetch dynamic categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/api/categories/");
        if (response.data && response.data.length > 0) {
          setCategories(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch dynamic categories in Collections:", err);
      }
    };

    fetchCategories();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/api/products/");
        setProducts(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError(
          "Unable to load the collection. Please make sure the backend server is running."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Calculate product counts per Sub-Section
  const sectionCounts = useMemo(() => {
    const counts = { all: products.length, women: 0, men: 0, kids: 0 };
    products.forEach((p) => {
      const sec = getProductSection(p);
      if (counts[sec] !== undefined) {
        counts[sec] += 1;
      } else {
        counts.women += 1;
      }
    });
    return counts;
  }, [products]);

  // Filter categories for the active sub-section
  const displayedCategories = useMemo(() => {
    let list = [];
    if (activeSection === "all") {
      const seen = new Set();
      categories.forEach((c) => {
        if (!seen.has(c.name)) {
          seen.add(c.name);
          list.push(c.name);
        }
      });
    } else {
      list = categories
        .filter((c) => (c.section || "women") === activeSection)
        .map((c) => c.name);
    }

    const firstPill =
      activeSection === "women"
        ? "All Women's"
        : activeSection === "men"
        ? "All Men's"
        : activeSection === "kids"
        ? "All Kids'"
        : "All Pieces";

    return [firstPill, ...list];
  }, [activeSection, categories]);

  // Category counts within current active section
  const categoryCounts = useMemo(() => {
    const counts = {};
    const firstPill = displayedCategories[0];
    if (firstPill) {
      counts[firstPill] =
        activeSection === "all"
          ? products.length
          : products.filter((p) => getProductSection(p) === activeSection).length;
    }

    displayedCategories.slice(1).forEach((catName) => {
      counts[catName] = products.filter((p) => {
        const matchesSec =
          activeSection === "all" || getProductSection(p) === activeSection;
        return matchesSec && isCategoryMatch(p, catName);
      }).length;
    });

    return counts;
  }, [products, activeSection, displayedCategories]);

  // Sub-section click handler
  const handleSectionChange = (sectionKey) => {
    setActiveSection(sectionKey);
    setActiveCategory("All");
    const newParams = new URLSearchParams(searchParams);
    if (sectionKey === "all") {
      newParams.delete("section");
    } else {
      newParams.set("section", sectionKey);
    }
    newParams.delete("category");
    setSearchParams(newParams, { replace: true });
  };

  // Category click handler
  const handleCategoryClick = (categoryName) => {
    const isFirstPill = categoryName === displayedCategories[0];
    const newParams = new URLSearchParams(searchParams);

    if (isFirstPill || categoryName === "All") {
      setActiveCategory("All");
      newParams.delete("category");
    } else {
      setActiveCategory(categoryName);
      newParams.set("category", categoryName);
    }
    setSearchParams(newParams, { replace: true });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setActiveSection("all");
    setActiveCategory("All");
    setSearchTerm("");
    setOnlyInStock(false);
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("section");
    newParams.delete("category");
    setSearchParams(newParams, { replace: true });
  };

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // 1. Sub-Section Filter
    if (activeSection !== "all") {
      result = result.filter(
        (product) => getProductSection(product) === activeSection
      );
    }

    // 2. Category Filter
    if (activeCategory && activeCategory !== "All" && activeCategory !== displayedCategories[0]) {
      result = result.filter((product) =>
        isCategoryMatch(product, activeCategory)
      );
    }

    // 3. In-Stock Filter
    if (onlyInStock) {
      result = result.filter(
        (product) =>
          product.stock_status !== "Out of Stock" &&
          !(
            typeof product.stock_status === "string" &&
            product.stock_status.toLowerCase().includes("out")
          )
      );
    }

    // 4. Search Filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();
      result = result.filter((product) => {
        const name = (product.name || "").toLowerCase();
        const cat = (product.category || "").toLowerCase();
        const catName = (product.category_details?.name || "").toLowerCase();
        const desc = (product.description || "").toLowerCase();
        const fabric = (product.fabric || "").toLowerCase();
        const sec = (product.section || "").toLowerCase();

        return (
          name.includes(search) ||
          cat.includes(search) ||
          catName.includes(search) ||
          desc.includes(search) ||
          fabric.includes(search) ||
          sec.includes(search)
        );
      });
    }

    // 5. Sorting
    if (sortBy === "Featured") {
      result.sort((a, b) => {
        const aFeatured =
          (a.is_new_collection ? 2 : 0) + (a.is_best_seller ? 1 : 0);
        const bFeatured =
          (b.is_new_collection ? 2 : 0) + (b.is_best_seller ? 1 : 0);
        return bFeatured - aFeatured;
      });
    }

    if (sortBy === "Newest") {
      result.sort(
        (a, b) =>
          new Date(b.created_at || 0) - new Date(a.created_at || 0)
      );
    }

    if (sortBy === "Price: Low to High") {
      result.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    }

    if (sortBy === "Price: High to Low") {
      result.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    }

    return result;
  }, [products, activeSection, activeCategory, displayedCategories, onlyInStock, searchTerm, sortBy]);

  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const isFirstPillActive =
    activeCategory === "All" || activeCategory === displayedCategories[0];

  const hasActiveFilters =
    activeSection !== "all" ||
    !isFirstPillActive ||
    onlyInStock ||
    Boolean(searchTerm.trim());

  const currentHero = HERO_CONTENT[activeSection] || HERO_CONTENT.all;

  return (
    <>
      <Navbar />

      <main className="collections-page">
        {/* Collections Hero Header */}
        <section className="collections-hero">
          <div className="collections-hero-inner">
            <span className="collections-eyebrow">
              {currentHero.eyebrow}
            </span>

            <h1>{currentHero.title}</h1>

            <p>{currentHero.subtitle}</p>

            {/* Micro Trust Ribbon */}
            <div className="collections-hero-ribbon">
              <span className="hero-ribbon-item">
                🌸 Consecrated in Sri Dham Vrindavan
              </span>
              <span className="hero-ribbon-item">
                📦 Pan-India & Global Express Delivery
              </span>
              <span className="hero-ribbon-item">
                ⚖️ Weight-Calculated Shipping
              </span>
            </div>
          </div>
        </section>

        <section className="collections-content">
          {/* 1. Tactile Wardrobe Switcher (Women, Men, Kids, All) */}
          <div className="collections-subsections-nav">
            <div className="subsections-tabs-wrapper">
              {SUBSECTIONS.map((sec) => {
                const isActive = activeSection === sec.key;
                const count = sectionCounts[sec.key];

                return (
                  <button
                    key={sec.key}
                    type="button"
                    className={`subsection-tab-btn ${isActive ? "active" : ""}`}
                    onClick={() => handleSectionChange(sec.key)}
                    aria-label={`View ${sec.label}`}
                  >
                    <span className="subsection-tab-icon">{sec.icon}</span>
                    <div className="subsection-tab-info">
                      <span className="subsection-tab-title">{sec.label}</span>
                      <small className="subsection-tab-tag">{sec.tag}</small>
                    </div>
                    {count !== undefined && (
                      <span className="subsection-tab-count">{count}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Sticky Handsy Control Deck */}
          <div className="collections-sticky-deck">
            {/* Upper Rail: Horizontal Swipeable Category Pills */}
            <div className="deck-category-rail">
              <span className="rail-label">Categories:</span>
              <div className="deck-pills-scroll">
                {displayedCategories.map((catName, index) => {
                  const isSelected =
                    index === 0
                      ? isFirstPillActive
                      : normalizeText(activeCategory) === normalizeText(catName);
                  const count = categoryCounts[catName];

                  return (
                    <button
                      key={catName}
                      type="button"
                      className={`deck-pill-btn ${isSelected ? "active" : ""}`}
                      onClick={() => handleCategoryClick(catName)}
                    >
                      <span>{catName}</span>
                      {count !== undefined && (
                        <span className="deck-pill-counter">{count}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lower Rail: Quick Filters, Live Search & Sort */}
            <div className="deck-controls-rail">
              {/* Left group: Quick In-Stock Toggle */}
              <div className="deck-left-controls">
                <button
                  type="button"
                  className={`deck-quick-toggle ${onlyInStock ? "active" : ""}`}
                  onClick={() => setOnlyInStock(!onlyInStock)}
                  title="Show only available in-stock designs"
                >
                  <span className="toggle-dot" />
                  <span>In Stock Only</span>
                </button>
              </div>

              {/* Center group: Live Search Bar */}
              <div className="deck-search-wrap">
                <span className="deck-search-icon" aria-hidden="true">
                  🔍
                </span>
                <input
                  type="search"
                  className="deck-search-input"
                  placeholder={`Search in ${
                    activeSection === "all"
                      ? "all creations"
                      : activeSection + "'s attire"
                  }...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search within active collection"
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="deck-search-clear"
                    onClick={() => setSearchTerm("")}
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Right group: Sort and Grid View Density */}
              <div className="deck-right-controls">
                <div className="deck-sort-box">
                  <span className="deck-sort-label">Sort:</span>
                  <select
                    className="deck-sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    aria-label="Sort products"
                  >
                    <option value="Featured">Featured</option>
                    <option value="Newest">Newest Arrivals</option>
                    <option value="Price: Low to High">Price: Low to High</option>
                    <option value="Price: High to Low">Price: High to Low</option>
                  </select>
                </div>

                <div className="deck-density-toggle" aria-label="Layout view">
                  <button
                    type="button"
                    className={`density-btn ${gridColumns === 3 ? "active" : ""}`}
                    onClick={() => setGridColumns(3)}
                    title="Spacious 3-column view"
                  >
                    <span>|||</span>
                  </button>
                  <button
                    type="button"
                    className={`density-btn ${gridColumns === 4 ? "active" : ""}`}
                    onClick={() => setGridColumns(4)}
                    title="Compact 4-column view"
                  >
                    <span>||||</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Active Filters Ribbon */}
          {hasActiveFilters && (
            <div className="collections-active-filters">
              <span className="active-filters-label">Active Filters:</span>

              {activeSection !== "all" && (
                <span className="active-filter-chip">
                  Section:{" "}
                  <strong>
                    {SUBSECTIONS.find((s) => s.key === activeSection)?.label}
                  </strong>
                  <button
                    type="button"
                    onClick={() => handleSectionChange("all")}
                    aria-label="Remove section filter"
                  >
                    ✕
                  </button>
                </span>
              )}

              {!isFirstPillActive && (
                <span className="active-filter-chip">
                  Category: <strong>{activeCategory}</strong>
                  <button
                    type="button"
                    onClick={() => handleCategoryClick("All")}
                    aria-label="Remove category filter"
                  >
                    ✕
                  </button>
                </span>
              )}

              {onlyInStock && (
                <span className="active-filter-chip">
                  Filter: <strong>In Stock Only</strong>
                  <button
                    type="button"
                    onClick={() => setOnlyInStock(false)}
                    aria-label="Remove in-stock filter"
                  >
                    ✕
                  </button>
                </span>
              )}

              {searchTerm.trim() && (
                <span className="active-filter-chip">
                  Search: <strong>"{searchTerm}"</strong>
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    aria-label="Remove search filter"
                  >
                    ✕
                  </button>
                </span>
              )}

              <button
                type="button"
                className="clear-all-filters-btn"
                onClick={clearAllFilters}
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Results Count Header */}
          <div className="collections-results-heading">
            <span>
              {loading
                ? "Curating sacred collection..."
                : `Showing ${paginatedProducts.length} of ${
                    filteredProducts.length
                  } ${
                    filteredProducts.length === 1 ? "sacred piece" : "sacred pieces"
                  }${
                    activeSection !== "all"
                      ? ` in ${SUBSECTIONS.find((s) => s.key === activeSection)?.label}`
                      : ""
                  }`}
            </span>
          </div>

          {/* Skeleton Shimmer Loading State */}
          {loading && (
            <div className={`product-grid columns-${gridColumns}`}>
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="collection-skeleton-card">
                  <div className="skeleton-image shimmer" />
                  <div className="skeleton-info">
                    <div className="skeleton-line skeleton-category shimmer" />
                    <div className="skeleton-line skeleton-title shimmer" />
                    <div className="skeleton-line skeleton-price shimmer" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && !loading && (
            <div className="collections-message collections-error">
              <p>{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredProducts.length === 0 && (
            <div className="collections-empty-state">
              <div className="collections-empty-icon">🌸</div>
              <h3>
                {!isFirstPillActive
                  ? `No pieces found in "${activeCategory}"`
                  : activeSection !== "all"
                  ? `No pieces currently found in ${SUBSECTIONS.find((s) => s.key === activeSection)?.label}`
                  : onlyInStock
                  ? "All pieces in this selection are currently consecrated or reserved"
                  : searchTerm
                  ? `No sacred pieces matching "${searchTerm}"`
                  : "No products currently available"}
              </h3>
              <p>
                {!isFirstPillActive
                  ? `We are handcrafting sacred attire for ${activeCategory}. In the meantime, discover all available creations.`
                  : activeSection !== "all"
                  ? `New designs for this section are being prepared by Vrindavan artisans.`
                  : "Try checking your spelling or clearing active filters to browse all Vrindavan attire."}
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  className="collections-browse-all-btn"
                  onClick={clearAllFilters}
                >
                  Browse All Sacred Pieces ({products.length})
                </button>
              )}
            </div>
          )}

          {/* Products Grid & Load More */}
          {!loading && !error && filteredProducts.length > 0 && (
            <>
              <div className={`collections-grid-wrapper columns-${gridColumns}`}>
                <ProductGrid
                  products={paginatedProducts}
                  onProductClick={(product) =>
                    navigate(`/product/${product.id}`)
                  }
                />
              </div>

              {filteredProducts.length > visibleCount && (
                <div className="collections-load-more-container">
                  <div className="collections-progress-wrap">
                    <div className="collections-progress-bar">
                      <div
                        className="collections-progress-fill"
                        style={{
                          width: `${Math.min(
                            100,
                            (paginatedProducts.length / filteredProducts.length) * 100
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="collections-progress-text">
                      Showing {paginatedProducts.length} of{" "}
                      {filteredProducts.length} pieces
                    </span>
                  </div>

                  <button
                    type="button"
                    className="collections-load-more-btn"
                    onClick={() =>
                      setVisibleCount((prev) => prev + PAGE_SIZE)
                    }
                  >
                    Load More Sacred Pieces ↓
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Collections;