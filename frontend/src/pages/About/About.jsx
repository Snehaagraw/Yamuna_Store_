import "./About.css";

import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";

const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/place/Yamuna+Store/@27.5833134,77.6976848,17z/data=!3m1!4b1!4m6!3m5!1s0x39736e351a126c33:0x2d7091d2212b9698!8m2!3d27.5833134!4d77.6976848!16s%2Fg%2F11hbfhhtsn?entry=ttu";

function About() {
  return (
    <div className="about-page">
      <Navbar />

      <main>
        {/* =====================================================
            OUR STORY
            ===================================================== */}
        <section className="about-story">
          <div className="about-story-content">
            <p className="about-eyebrow">
              OUR STORY · SINCE 2014
            </p>

            <h1>
              From Vrindavan,
              <br />
              <em>to devotees everywhere.</em>
            </h1>

            <div className="about-story-text">
              <p>
                Yamuna Store is a small family-run clothing store
                rooted in Vrindavan, where our journey began in 2014.
                We offer both retail and wholesale clothing, bringing
                together traditional styles for devotees and customers
                looking for comfortable, colorful and culturally rooted
                wear.
              </p>

              <p>
                Our collection includes Gopi Dresses, sarees, kurti
                sets, short kurties, cotton blouses, dupattas, cotton
                leggings, devotional T-shirts and traditional Dhoti
                Kurta for men. Our devotional T-shirts and Gopi Dresses
                are available in a wide range of sizes for customers of
                all ages.
              </p>

              <p>
                A major part of our work is serving ISKCON temples and
                communities. We supply clothing to ISKCON temples across
                India and also serve customers and communities in other
                countries.
              </p>
            </div>
          </div>

          <div className="about-story-image">
            <div className="about-image-placeholder">
              <span>YAMUNA STORE</span>
              <small>STORE PHOTO</small>
            </div>
          </div>
        </section>

        {/* =====================================================
            VISIT US / CONTACT
            ===================================================== */}
        <section className="about-contact">
          <div className="about-contact-heading">
            <p className="about-eyebrow">
              VISIT US
            </p>

            <h2>
              Come by and
              <br />
              <em>see us.</em>
            </h2>
          </div>

          <div className="about-contact-details">
            <div className="about-contact-block">
              <span className="about-contact-label">
                STORE
              </span>

              <p>
                Yamuna Store
                <br />
                Vrindavan, 281121
                <br />
                Uttar Pradesh, India
              </p>
            </div>

            <div className="about-contact-block">
              <span className="about-contact-label">
                CONTACT
              </span>

              <a href="tel:+916397972342">
                Haridas Agrawal
                <br />
                6397972342
              </a>

              <a href="tel:+918533804168">
                Vaibhav Agrawal
                <br />
                8533804168
              </a>
            </div>

            <div className="about-contact-block">
              <span className="about-contact-label">
                OPENING HOURS
              </span>

              <p>
                Every day
                <br />
                9:00 AM – 10:00 PM
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            MAP
            ===================================================== */}
        <section className="about-location">
          <div className="about-location-heading">
            <div>
              <p className="about-eyebrow">
                FIND US IN VRINDAVAN
              </p>

              <h2>
                Come visit
                <br />
                <em>Yamuna Store.</em>
              </h2>
            </div>

            <p>
              Find our store in Vrindavan using the map below.
              We look forward to welcoming you.
            </p>
          </div>

          <div className="about-map">
            <iframe
              title="Yamuna Store Location"
              src="https://www.google.com/maps?q=27.5833134,77.6976848&z=17&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>

          <a
    href="https://www.google.com/maps/place/Yamuna+Store/@27.5833134,77.6976848,17z/data=!3m1!4b1!4m6!3m5!1s0x39736e351a126c33:0x2d7091d2212b9698!8m2!3d27.5833134!4d77.6976848!16s%2Fg%2F11hbfhhtsn?entry=ttu"
    target="_blank"
    rel="noopener noreferrer"
    className="about-map-link"
  >
    Open in Google Maps <span>→</span>
  </a>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default About;