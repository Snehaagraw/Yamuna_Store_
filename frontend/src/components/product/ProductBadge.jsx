function ProductBadge({ type }) {
  if (!type) {
    return null;
  }

  const badgeText = {
    new: "New",
    bestSeller: "Best Seller",
  };

  return (
    <span className={`product-badge product-badge-${type}`}>
      {badgeText[type] || type}
    </span>
  );
}

export default ProductBadge;