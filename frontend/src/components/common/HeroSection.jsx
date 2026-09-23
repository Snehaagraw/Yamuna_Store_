import { Link } from "react-router-dom";
import mainImage from "../../assets/images/mainHero.png"; 
import secondaryImage from "../../assets/images/secondHero.png"; 

function HeroSection() {  

  return (
    <section className="hero-section">
      <div className="hero-decoration hero-decoration-top" />
      <div className="hero-decoration hero-decoration-bottom" />

      <div className="hero-content">
        <p className="hero-eyebrow">
          RADHE RADHE · SINCE 2014
        </p>

        <h1>
          Rooted in
          <br />
          <span>Vrindavan.</span>
          <br />
          Worn with
          <br />
          <em>Devotion.</em>
        </h1>

        <p className="hero-description">
          Traditional devotional clothing, thoughtfully chosen
          for every occasion.
        </p>

        <div className="hero-actions">
          <Link
            to="/collections"
            className="hero-button hero-button-primary"
          >
            Explore <span>→</span>
          </Link>

          <Link
            to="/about"
            className="hero-button hero-button-secondary"
          >
            Visit Us
          </Link>
        </div>
      </div>

      <div className="hero-visual">
        <div className="hero-image-main">
          <img
            src={mainImage}
            alt="Yamuna Store devotional clothing"
          />
        </div>

        <div className="hero-image-secondary">
          <img
            src={secondaryImage}
            alt="Yamuna Store collection"
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

      <div className="hero-pagination">
        <span className="pagination-dot active" />
        <span className="pagination-dot" />
        <span className="pagination-dot" />
        <span className="pagination-dot" />
      </div>
    </section>
  );
}

export default HeroSection;