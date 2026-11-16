import { Link } from "react-router-dom";
import mainImage from "../../assets/images/mainHero.webp"; 
import secondaryImage from "../../assets/images/secondHero.webp"; 

function HeroSection() {  
  return (
    <section className="hero-section" aria-label="Yamuna Store - Traditional Clothing from Vrindavan">
      <div className="hero-content">
        <p className="hero-eyebrow">
          RADHE RADHE · TRADITIONAL CLOTHING · SINCE 2014
        </p>

        <h1>
          Sacred Clothing
          <br />
          <span>&amp; Ethnic Wear.</span>
          <br />
          Rooted in
          <br />
          <em>Vrindavan.</em>
        </h1>

        <p className="hero-description">
          Handcrafted Gopi Dresses, Pure Silk &amp; Cotton Sarees, Kurta Sets, and Traditional Dhotis — pure fabrics woven with devotion for daily seva, temple darshan, and celebrations.
        </p>

        <div className="hero-actions">
          <Link
            to="/collections"
            className="hero-button hero-button-primary"
          >
            Shop Clothing <span>→</span>
          </Link>

          <Link
            to="/about"
            className="hero-button hero-button-secondary"
          >
            Visit Our Store
          </Link>
        </div>
      </div>

      <div className="hero-visual">
        <div className="hero-image-main">
          <img
            src={mainImage}
            alt="Yamuna Store traditional devotional clothing"
            fetchPriority="high"
            decoding="async"
            width="540"
            height="680"
          />
        </div>

        <div className="hero-image-secondary">
          <img
            src={secondaryImage}
            alt="Yamuna Store collection"
            fetchPriority="high"
            decoding="async"
            width="340"
            height="440"
          />
        </div>

        <div className="radhe-badge">
          <div className="radhe-badge-inner">
            <span className="badge-made">
              Radhe
            </span>

            <span className="badge-slowly">
              Radhe
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;