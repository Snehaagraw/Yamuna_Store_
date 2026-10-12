import { Link } from "react-router-dom";

function CollectionCard({
  name,
  image,
  badge,
  href = "/collections",
  category,
}) {
  return (
    <Link
      to={
        category
          ? `/collections?category=${encodeURIComponent(category)}`
          : href
      }
      state={
        category
          ? { selectedCategory: category }
          : undefined
      }
      className="collection-card"
    >
      <div className="collection-card-image">
        <img
          src={image}
          alt={name}
        />

        {badge && (
          <span className="collection-card-badge">
            {badge}
          </span>
        )}

        <div className="collection-card-shade" />

        <div className="collection-card-content">
          <h3>{name}</h3>

          <span className="collection-card-arrow">
            Explore <b>→</b>
          </span>
        </div>
      </div>
    </Link>
  );
}

export default CollectionCard;