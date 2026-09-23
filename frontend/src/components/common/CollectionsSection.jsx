import { Link } from "react-router-dom";

import collectionCover1 from "../../assets/images/collectionCover1.png";
import collectionCover2 from "../../assets/images/collectionCover2.png";
import collectionCover3 from "../../assets/images/collectionCover3.png";
import collectionCover4 from "../../assets/images/collectionCover4.png";
import collectionCover5 from "../../assets/images/collectionCover5.png";

const collections = [
  {
    title: "Gopi Dress",
    category: "Gopi Dress",
    image: collectionCover1,
  },
  {
    title: "Sarees",
    category: "Sarees",
    image: collectionCover2,
  },
  {
    title: "Dhoti Kurta",
    category: "Dhoti Kurta",
    image: collectionCover5,
  },
  {
    title: "Kurties",
    category: "Kurties",
    image: collectionCover3,
  },
  {
    title: "Dupattas",
    category: "Dupattas",
    image: collectionCover4,
  },
];

function CollectionsSection() {
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
        {collections.map((collection) => (
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
              />
            </div>

            <div className="collection-card-content">
              <h3 className="collection-card-title">
                {collection.title}
              </h3>

              <span className="collection-card-arrow">→</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default CollectionsSection;