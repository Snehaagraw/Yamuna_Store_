import { Link } from "react-router-dom";

function AboutSection() {
  return (
    <section className="about-section">
      <div className="about-section-content">
        <div className="about-section-heading">

          <h2>
            From
            <br />
            <span>Vrindavan</span>
            <br />
            to the
            <br />
            <em>world.</em>
          </h2>
        </div>

        <div className="about-section-copy">
          <p className="about-section-description">
            Yamuna Store brings together traditional clothing inspired by the heritage of Vrindavan. From breathable cottons to elegant silks and natural jute, our collection offers a variety of colors and styles, thoughtfully selected for everyday wear and special occasions, and shared with customers around the world.
          </p>

          <Link to="/about" className="about-section-link">
            DISCOVER OUR STORY
            <span>→</span>
          </Link>

          <p className="about-section-detail">
            SINCE 2014&nbsp; · &nbsp;VRINDAVAN
          </p>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;