import ProductCard from "./ProductCard";

function ProductGrid({ products = [], onProductClick }) {
  if (products.length === 0) {
    return (
      <div className="product-grid-empty">
        <p>No products available.</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onClick={() => onProductClick?.(product)}
        />
      ))}
    </div>
  );
}

export default ProductGrid;