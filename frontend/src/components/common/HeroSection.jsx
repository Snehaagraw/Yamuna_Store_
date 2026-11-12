import { Link } from "react-router-dom";
import mainImage from "../../assets/images/mainHero.png"; 
import secondaryImage from "../../assets/images/secondHero.png"; 

function HeroSection() {  
  return (
    <section className="hero-section" aria-label="Yamuna Store - Traditional Clothing from Vrindavan">
      <div className="hero-content">
        <div className="hero-badge-pill">
          <span className="badge-dot" />
          <span>TRADITIONAL DEVOTIONAL CLOTHING · VRINDAVAN</span>
        </div>

        <h1>
          Sacred Clothing &amp; Ethnic Wear
          <span className="hero-highlight"> from Vrindavan.</span>
        </h1>

        <p className="hero-description">
          Handcrafted Gopi Dresses, Pure Silk &amp; Cotton Sarees, Kurta Sets, and Traditional Dhotis — pure fabrics woven with devotion for daily seva, temple darshan, and celebrations.
        </p>

        {/* Interactive Clothing Category Quick-Pills */}
        <div className="hero-category-pills" aria-label="Browse clothing categories">
          <Link to="/collections?section=women&category=Gopi+Dress" className="hero-cat-pill">
            <span className="pill-icon">🌸</span> Gopi Dresses
          </Link>
          <Link to="/collections?section=women&category=Sarees" className="hero-cat-pill">
            <span className="pill-icon">🥻</span> Sarees
          </Link>
          <Link to="/collections?section=men&category=Kurta" className="hero-cat-pill">
            <span className="pill-icon">✨</span> Kurta Sets
          </Link>
          <Link to="/collections?section=men&category=Dhoti+Kurta" className="hero-cat-pill">
            <span className="pill-icon">🪷</span> Dhoti Kurta
          </Link>
          <Link to="/collections?section=women&category=Dupattas" className="hero-cat-pill">
            <span className="pill-icon">🧣</span> Dupattas
          </Link>
        </div>

        <div className="hero-actions">
          <Link
            to="/collections"
            className="hero-button hero-button-primary"
          >
            Shop All Clothing <span>→</span>
          </Link>

          <Link
            to="/about"
            className="hero-button hero-button-secondary"
          >
            Visit Our Store
          </Link>
        </div>

        <div className="hero-guarantees">
          <span className="guarantee-item">✓ 100% Pure Fabrics (Cotton &amp; Silk)</span>
          <span className="guarantee-dot">·</span>
          <span className="guarantee-item">✓ Sourced Directly from Sri Dham</span>
          <span className="guarantee-dot">·</span>
          <span className="guarantee-item">✓ Worldwide Delivery</span>
        </div>
      </div>

      <div className="hero-visual">
        <div className="hero-image-card hero-image-main">
          <img
            src={mainImage}
            alt="Traditional Vrindavan Devotional Clothing"
          />
          <div className="hero-image-caption">
            <strong>Authentic Vrindavan Attire</strong>
            <small>Pure Handlooms &amp; Cotton</small>
          </div>
        </div>

        <div className="hero-image-card hero-image-secondary">
          <img
            src={secondaryImage}
            alt="Vrindavan Temple Collection"
          />
        </div>

        <div className="hero-floating-tag">
          <span className="floating-tag-om">॥ श्री राधा ॥</span>
          <span className="floating-tag-title">Yamuna Store</span>
          <span className="floating-tag-sub">Clothing Boutique · Since 2014</span>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;