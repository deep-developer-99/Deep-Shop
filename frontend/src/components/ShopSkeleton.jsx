import "../styles/shopSkeleton.css";

const ShopSkeleton = () => {
  return (
    <div className="shop-skeleton">
      {/* Search Bar */}
      <div className="skeleton-title shimmer"></div>
      <div className="skeleton-search shimmer"></div>

      {/* Product Cards */}
      <div className="skeleton-grid">
        {[...Array(8)].map((_, index) => (
          <div className="skeleton-card" key={index}>
            <div className="skeleton-image shimmer"></div>

            <div className="skeleton-content">
              <div className="skeleton-name shimmer"></div>
              <div className="skeleton-price shimmer"></div>
              <div className="skeleton-btn shimmer"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopSkeleton;
