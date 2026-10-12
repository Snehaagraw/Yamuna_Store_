import { useState, useEffect } from "react";
import api from "../../api/client";
import "../../styles/reviewsSection.css";

function ReviewsSection() {
  const [reviewsList, setReviewsList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [form, setForm] = useState({
    name: "",
    location: "",
    rating: 5,
    title: "",
    comment: "",
  });

  useEffect(() => {
    let isMounted = true;
    const fetchReviews = async () => {
      try {
        const res = await api.get("/api/reviews/");
        if (isMounted && res.data && Array.isArray(res.data)) {
          setReviewsList(res.data);
        }
      } catch (err) {
        console.error("Failed to load real-time reviews:", err);
      }
    };

    fetchReviews();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.comment.trim()) return;

    try {
      setSubmitting(true);
      const res = await api.post("/api/reviews/", {
        name: form.name.trim(),
        location: form.location.trim() || "India",
        rating: Number(form.rating),
        title: form.title.trim() || "Devotional Blessings",
        comment: form.comment.trim(),
        is_featured: true,
      });

      setReviewsList((prev) => [res.data, ...prev]);
      setSuccessMsg("Radhe Radhe! Your review has been lovingly received.");
      setForm({ name: "", location: "", rating: 5, title: "", comment: "" });
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMsg("");
      }, 2500);
    } catch (err) {
      console.error("Failed to submit review:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="reviews-section">
      <div className="reviews-container">
        <div className="reviews-header">
          <span className="reviews-eyebrow">
            ॥ श्री राधेश्याम ॥ · DEVOTEE TESTIMONIALS
          </span>
          <h2>
            Worn in Darshan,
            <br />
            <em>cherished across the world.</em>
          </h2>
          <p className="reviews-intro">
            From Sri Vrindavan Dham to temples and devotee homes across India and
            abroad, read genuine experiences of our sacred handlooms.
          </p>

          <button
            type="button"
            className="write-store-review-btn"
            onClick={() => setIsModalOpen(true)}
          >
            ✍️ Write a Review / Share Your Blessing
          </button>
        </div>

        {reviewsList.length > 0 ? (
          <div className="reviews-grid">
            {reviewsList.slice(0, 6).map((item) => (
              <article key={item.id} className="review-card">
                <div className="review-card-top">
                  <div className="review-stars">
                    {"★".repeat(item.rating || 5)}
                  </div>
                  <span className="review-verified-pill">
                    🌸 Verified Devotee
                  </span>
                </div>

                {item.title && <h3 className="review-title">"{item.title}"</h3>}

                <p className="review-body">{item.comment || item.review}</p>

                <div className="review-author">
                  <div className="author-avatar">
                    {item.name ? item.name.charAt(0) : "🌸"}
                  </div>
                  <div className="author-info">
                    <strong>{item.name}</strong>
                    <small>
                      {item.location || "Devotee"} · Handcrafted Wear
                    </small>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="reviews-empty-state">
            <span className="reviews-empty-icon">🌸</span>
            <h3 className="reviews-empty-title">
              Be the First Devotee to Share a Blessing
            </h3>
            <p className="reviews-empty-text">
              All reviews on Sri Yamuna Store are 100% genuine experiences from real
              devotees. Have you received your attire from Sri Vrindavan Dham?
              Share your blessing and fitting experience with devotees worldwide.
            </p>
            <button
              type="button"
              className="write-store-review-btn write-first-btn"
              onClick={() => setIsModalOpen(true)}
            >
              ✍️ Write the First Review
            </button>
          </div>
        )}

        <div className="reviews-footer-note">
          <span>🌸 100% Authentic Vrindavan Handcrafted Attire</span>
          <span>•</span>
          <span>📦 Trusted by Devotees & Temples in 50+ Countries</span>
          <span>•</span>
          <span>⚖️ Direct Dham Craftsmanship</span>
        </div>
      </div>

      {/* Write a Review Modal */}
      {isModalOpen && (
        <div className="review-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div
            className="review-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="review-modal-header">
              <div>
                <span className="modal-om">॥ राधे राधे ॥</span>
                <h3>Share Your Devotional Experience</h3>
              </div>
              <button
                type="button"
                className="review-modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            {successMsg ? (
              <div className="review-modal-success">
                <span className="success-icon">🌸</span>
                <h4>{successMsg}</h4>
                <p>May Sri Sri Radha Shyamsundar bless your devotional journey.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="review-modal-form">
                <div className="rating-select-group">
                  <label>Your Star Rating *</label>
                  <div className="interactive-star-picker">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        className={`star-pick-btn ${
                          form.rating >= star ? "filled" : ""
                        }`}
                        onClick={() => setForm({ ...form, rating: star })}
                      >
                        ★
                      </button>
                    ))}
                    <span className="star-rating-label">
                      {form.rating === 5
                        ? "5 Stars · Divine / Exceptional"
                        : form.rating === 4
                        ? "4 Stars · Very Good"
                        : `${form.rating} Stars`}
                    </span>
                  </div>
                </div>

                <div className="review-form-row">
                  <div className="review-form-field">
                    <label>Your Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Radha Priya Dasi"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="review-form-field">
                    <label>Your City / Temple *</label>
                    <input
                      type="text"
                      placeholder="e.g. Mumbai / ISKCON London"
                      value={form.location}
                      onChange={(e) =>
                        setForm({ ...form, location: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="review-form-field">
                  <label>Review Headline</label>
                  <input
                    type="text"
                    placeholder="e.g. Blessed quality, pristine stitching"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>

                <div className="review-form-field">
                  <label>Your Devotional Review *</label>
                  <textarea
                    rows={4}
                    placeholder="Describe the fabric feel, drape, packaging, or parikrama experience..."
                    value={form.comment}
                    onChange={(e) =>
                      setForm({ ...form, comment: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="review-modal-actions">
                  <button
                    type="button"
                    className="modal-cancel-btn"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="modal-submit-btn"
                    disabled={submitting}
                  >
                    {submitting ? "Submitting Blessing..." : "Post Review ✓"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default ReviewsSection;
