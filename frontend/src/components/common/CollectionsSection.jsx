import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client";

import collectionCover1 from "../../assets/images/collectionCover1.png";
import collectionCover2 from "../../assets/images/collectionCover2.png";
import collectionCover3 from "../../assets/images/collectionCover3.png";
import collectionCover4 from "../../assets/images/collectionCover4.png";
import collectionCover5 from "../../assets/images/collectionCover5.png";

const FALLBACK_COVERS = {
  "gopi dress": collectionCover1,
  "sarees": collectionCover2,
  "kurties": collectionCover3,
  "dupattas": collectionCover4,
  "dhoti kurta": collectionCover5,
};

const MAX_DISPLAY_SLOTS = 4;

const PRIORITY_ORDER = [
  "gopi dress",
  "sarees",
  "dhoti kurta",
  "kurties",
  "dupattas",
];



function CollectionsSection() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/categories/");
        if (!isMounted) return;

        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          const fallbackList = [
            collectionCover1,
            collectionCover2,
            collectionCover3,
            collectionCover4,
            collectionCover5,
          ];

          // Prioritize flagship attire so limited slots show primary collections
          const sorted = [...response.data].sort((a, b) => {
            const indexA = PRIORITY_ORDER.indexOf(a.name.toLowerCase().trim());
            const indexB = PRIORITY_ORDER.indexOf(b.name.toLowerCase().trim());
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return 0;
          });

          const limited = sorted.slice(0, MAX_DISPLAY_SLOTS);

          const dynamicCollections = limited.map((cat, index) => {
            const key = cat.name.toLowerCase().trim();
            const fallback =
              FALLBACK_COVERS[key] || fallbackList[index % fallbackList.length];

            return {
              id: cat.id,
              title: cat.name,
              category: cat.name,
              image: cat.image || fallback,
            };
          });

          setCollections(dynamicCollections);
        } else {
          setCollections([]);
        }
      } catch (err) {
        console.error(
          "Failed to load dynamic collections for home section:",
          err
        );
        if (isMounted) setCollections([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  const displayCollections = collections.slice(0, MAX_DISPLAY_SLOTS);

  if (displayCollections.length === 0) {
    return null;
  }

  return (
    <section className="collections-section">
      <div className="collections-section-header">
        <div>
          <h2>
            Clothing for
            <br />
            <em>every Devotee.</em>
          </h2>
        </div>

        <Link
          to="/collections"
          className="collections-section-link"
        >
          VIEW ALL COLLECTIONS&nbsp;→
        </Link>
      </div>

      <div className="collection-grid">
        {displayCollections.map((collection, index) => (
          <Link
            to={`/collections?category=${encodeURIComponent(
              collection.category
            )}`}
            className="collection-card"
            key={collection.category}
          >
            <div className="collection-card-image">
              <img
                src={collection.image}
                alt={collection.title}
                className="collection-card-image"
                loading="lazy"
              />
            </div>

            <div className="collection-card-content">
              <span className="collection-card-number">0{index + 1}</span>
              <h3 className="collection-card-title">
                {collection.title}
              </h3>

              <span className="collection-card-arrow">Explore →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default CollectionsSection;