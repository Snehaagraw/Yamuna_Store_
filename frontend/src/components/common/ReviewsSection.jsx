import "../../styles/reviewsSection.css";

const reviews = [
  {
    id: 1,
    name: "Radhika Priya Dasi",
    location: "Vrindavan Dham",
    rating: 5,
    title: "Pure cotton comfort for parikrama",
    review:
      "The Gopi Dress from Yamuna Store is sewn with extraordinary care. The pure cotton fabric breathed easily even in the summer heat during Govardhan Parikrama. Truly blessed quality.",
    category: "Gopi Dress Collection",
  },
  {
    id: 2,
    name: "Damodar Das",
    location: "ISKCON Mayapur",
    rating: 5,
    title: "Perfect drape for temple darshan",
    review:
      "Our temple community has been ordering dhoti kurtas from Yamuna Store for years. The stitch quality and pure handloom feel make it our first choice for mangala aarti and celebrations.",
    category: "Dhoti Kurta Set",
  },
  {
    id: 3,
    name: "Meenakshi Agarwal",
    location: "New Delhi",
    rating: 5,
    title: "Traditional elegance and fast delivery",
    review:
      "Ordered a devotional saree and matching dupattas for Janmashtami. The colors matched the photos perfectly, and the package arrived from Vrindavan within 3 days. Haridas ji was so helpful on WhatsApp!",
    category: "Festive Saree Collection",
  },
];

function ReviewsSection() {
  return (
    <section className="reviews-section">
      <div className="reviews-container">
        <div className="reviews-header">
          <span className="reviews-eyebrow">VOICES OF DEVOTEES · REVIEWS</span>
          <h2>
            Worn in Darshan,
            <br />
            <em>cherished everywhere.</em>
          </h2>
          <p className="reviews-intro">
            From Vrindavan temple courtyards to homes across the world, hear how devotees experience the craftsmanship of Yamuna Store.
          </p>
        </div>

        <div className="reviews-grid">
          {reviews.map((item) => (
            <article key={item.id} className="review-card">
              <div className="review-stars">
                {"★".repeat(item.rating)}
              </div>

              <span className="review-category-tag">{item.category}</span>

              <h3 className="review-title">"{item.title}"</h3>

              <p className="review-body">{item.review}</p>

              <div className="review-author">
                <div className="author-avatar">
                  {item.name.charAt(0)}
                </div>
                <div className="author-info">
                  <strong>{item.name}</strong>
                  <small>{item.location} · Verified Devotee</small>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="reviews-footer-note">
          <span>100% Authentic Vrindavan Handcrafted Attire</span>
          <span>•</span>
          <span>Trusted by Devotees & Temples Since 2014</span>
        </div>
      </div>
    </section>
  );
}

export default ReviewsSection;
