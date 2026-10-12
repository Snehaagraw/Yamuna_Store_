import "./About.css";

import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import storeFrontImage from "../../assets/images/yamunaStoreFront.jpg";

const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/place/Yamuna+Store/@27.5833134,77.6976848,17z/data=!3m1!4b1!4m6!3m5!1s0x39736e351a126c33:0x2d7091d2212b9698!8m2!3d27.5833134!4d77.6976848!16s%2Fg%2F11hbfhhtsn?entry=ttu";

const WHATSAPP_MAIN =
  "https://wa.me/918533804168?text=Radhe%20Radhe!%20I%20am%20visiting%20Vrindavan%20and%20looking%20for%20Yamuna%20Store.";

const WHATSAPP_HARIDAS =
  "https://wa.me/916397972342?text=Radhe%20Radhe!%20I%20am%20visiting%20Vrindavan%20and%20looking%20for%20Yamuna%20Store.";

const WHATSAPP_VAIBHAV =
  "https://wa.me/918533804168?text=Radhe%20Radhe!%20I%20am%20visiting%20Vrindavan%20and%20looking%20for%20Yamuna%20Store.";

const WHATSAPP_WHOLESALE =
  "https://wa.me/918533804168?text=Hare%20Krishna!%20I%20am%20inquiring%20about%20bulk%20wholesale%20/%20temple%20seva%20attire%20from%20Yamuna%20Store.";

// ======================================================================
// 📷 STORE FRONT IMAGE CONFIGURATION
//
// In React / Vite, you can set this to:
//   1) The imported image:  storeFrontImage
//   2) Public folder path:  "/yamunaStoreFront.jpg"
//   3) The assets string:   "../../assets/images/yamunaStoreFront.jpg" (auto-mapped below)
//   4) External web URL:    "https://..."
// ======================================================================
const STORE_IMAGE_URL = storeFrontImage; // <-- Set your image here

// Auto-resolver helper: supports imported objects, web URLs, and string asset paths
const resolveStoreImage = (url) => {
  if (!url) return "";
  if (typeof url === "string" && url.includes("yamunaStoreFront")) {
    return storeFrontImage;
  }
  return url;
};

function About() {
  const displayImage = resolveStoreImage(STORE_IMAGE_URL);
  const scrollToMap = () => {
    const el = document.getElementById("store-map-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="about-page">
      <Navbar />

      <main>
        {/* =====================================================
            OUR STORY & HERO
            ===================================================== */}
        <section className="about-story">
          <div className="about-story-content">
            <p className="about-eyebrow">
              ॥ श्री राधेश्याम ॥ · OUR STORY & VISIT US · SINCE 2014
            </p>

            <h1>
              From Vrindavan,
              <br />
              <em>to devotees everywhere.</em>
            </h1>

            {/* Quick Action Bar for Pilgrims & Visitors */}
            <div className="about-quick-actions">
              <button
                type="button"
                className="quick-action-btn action-map"
                onClick={scrollToMap}
              >
                📍 Find on Map
              </button>
              <a
                href={WHATSAPP_MAIN}
                target="_blank"
                rel="noopener noreferrer"
                className="quick-action-btn action-wa"
              >
                💬 WhatsApp Us
              </a>
              <a
                href="tel:+918533804168"
                className="quick-action-btn action-call"
              >
                📞 Call Store
              </a>
            </div>

            <div className="about-story-text">
              <p>
                Yamuna Store is a family-run devotional clothing atelier
                rooted in Sri Vrindavan Dham, where our journey began in 2014.
                We offer both retail and wholesale clothing, bringing
                together traditional handloom attire for devotees seeking
                pure, comfortable, and spiritually uplifting wear.
              </p>

              <p>
                Our collection includes blessed Gopi Dresses, sarees, kurti
                sets, short kurties, cotton blouses, dupattas, pure cotton
                leggings, devotional T-shirts, and traditional Dhoti
                Kurtas for men. Every garment is tailored across sizes for
                devotees of all ages.
              </p>

              <p>
                A core part of our mission is serving ISKCON temples and
                devotee communities worldwide. We supply devotional clothing
                to temples across India and regularly fulfill orders for
                communities in over 50 countries.
              </p>
            </div>
          </div>

          {/* =====================================================
              STORE IMAGE CONTAINER
              - To add image: Set STORE_IMAGE_URL at Line 26 above,
                or replace src in <img src="..." />
              - Text removed as requested.
              ===================================================== */}
          <div className="about-storefront-frame">
            <div className="storefront-card">
              <div className="storefront-card-top-tag">
                <span className="top-tag-om">॥ श्री राधेश्याम ॥</span>
                <span className="top-tag-text">VRINDAVAN ATELIER · EST. 2014</span>
              </div>

              <div className="storefront-image-wrap">
                {displayImage ? (
                  <img
                    src={displayImage}
                    alt="Yamuna Store Front at Nidhivan Plaza, Near Nidhivan Temple, Vrindavan"
                    className="storefront-img"
                  />
                ) : (
                  <div className="about-image-placeholder" />
                )}
              </div>

              <div className="storefront-caption">
                <span className="caption-pin">📍</span>
                <div className="caption-text">
                  <strong>Inside Nidhivan Plaza, Near Nidhivan Temple</strong>
                  <small>Sri Vrindavan Dham · Open 7 Days (9:00 AM – 10:00 PM)</small>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            TEMPLE SEVA & WHOLESALE BADGE BANNER
            ===================================================== */}
        <section className="about-wholesale-strip">
          <div className="wholesale-strip-content">
            <div className="wholesale-strip-info">
              <span className="wholesale-badge">🪔 TEMPLE SEVA & WHOLESALE</span>
              <h3>Serving ISKCON & Worldwide Temples Since 2014</h3>
              <p>
                We provide bulk supply for temple gift shops, festival attire, brahmachari & deity seva dhotis,
                and custom community orders across India & internationally via express DHL.
              </p>
            </div>
            <a
              href={WHATSAPP_WHOLESALE}
              target="_blank"
              rel="noopener noreferrer"
              className="wholesale-inquiry-btn"
            >
              Wholesale / Temple Seva Inquiry →
            </a>
          </div>
        </section>

        {/* =====================================================
            VISIT US / STORE DETAILS
            ===================================================== */}
        <section className="about-contact">
          <div className="about-contact-heading">
            <p className="about-eyebrow">
              VISIT OUR PHYSICAL STORE
            </p>

            <h2>
              Come by and
              <br />
              <em>see us in Vrindavan.</em>
            </h2>
            <p className="contact-heading-sub">
              Step inside our shop near the sacred Nidhivan Temple. Feel the pure cottons,
              try on sizes, and take home blessed attire for darshan and seva.
            </p>
          </div>

          <div className="about-contact-details">
            {/* Store Landmark Address */}
            <div className="about-contact-block">
              <span className="about-contact-label">
                STORE LOCATION & LANDMARK
              </span>

              <p className="contact-address-text">
                <strong>Yamuna Store</strong>
                <br />
                Inside Nidhivan Plaza, Near Nidhivan Temple
                <br />
                Vrindavan — 281121
                <br />
                Mathura, Uttar Pradesh, India
              </p>

              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="address-map-badge"
              >
                📍 Open Google Maps Pin →
              </a>
            </div>

            {/* Direct Contact & 1-Tap WhatsApp */}
            <div className="about-contact-block">
              <span className="about-contact-label">
                TALK & WHATSAPP
              </span>

              <div className="contact-persons-list">
                <div className="contact-person-item">
                  <span className="person-name">Haridas Agrawal</span>
                  <div className="person-links">
                    <a href="tel:+916397972342" className="person-phone">
                      📞 6397972342
                    </a>
                    <a
                      href={WHATSAPP_HARIDAS}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="person-wa-btn"
                    >
                      💬 WhatsApp
                    </a>
                  </div>
                </div>

                <div className="contact-person-item">
                  <span className="person-name">Vaibhav Agrawal</span>
                  <div className="person-links">
                    <a href="tel:+918533804168" className="person-phone">
                      📞 8533804168
                    </a>
                    <a
                      href={WHATSAPP_VAIBHAV}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="person-wa-btn"
                    >
                      💬 WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              <a
                href="mailto:agrawaljii31415@gmail.com"
                className="contact-email-link"
              >
                ✉️ agrawaljii31415@gmail.com
              </a>
            </div>

            {/* Opening Hours */}
            <div className="about-contact-block">
              <span className="about-contact-label">
                OPENING HOURS
              </span>

              <p className="contact-hours-text">
                <strong>Open Every Day (7 Days)</strong>
                <br />
                9:00 AM – 10:00 PM
              </p>

              <div className="hours-darshan-tip">
                <span>🌸 Devotee Darshan Friendly</span>
                <small>
                  Open throughout morning and evening temple darshan hours.
                </small>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            PILGRIM'S TRAVEL GUIDE
            ===================================================== */}
        <section className="about-pilgrim-guide">
          <div className="pilgrim-guide-header">
            <span className="about-eyebrow">
              PILGRIM'S GUIDE · HOW TO REACH US
            </span>
            <h2>Reaching Yamuna Store in Vrindavan</h2>
            <p>
              Vrindavan's heritage streets are pedestrian and e-rickshaw friendly. Here is how to easily navigate to us from major spots:
            </p>
          </div>

          <div className="pilgrim-cards-grid">
            <div className="pilgrim-card">
              <span className="pilgrim-card-icon">🛺</span>
              <h3>From ISKCON / Prem Mandir</h3>
              <p>
                Take any local E-rickshaw toward Nidhivan Temple (approx. 10–12 minutes). Ask the driver for Nidhivan Plaza right on the temple approach.
              </p>
              <span className="pilgrim-time-badge">⏱ ~10–12 Mins</span>
            </div>

            <div className="pilgrim-card">
              <span className="pilgrim-card-icon">🛕</span>
              <h3>From Banke Bihari Temple</h3>
              <p>
                Just a pleasant 5–7 minute stroll through the vibrant bazaar lanes or a 3-minute cycle/e-rickshaw ride directly to Nidhivan Plaza.
              </p>
              <span className="pilgrim-time-badge">⏱ ~5–7 Mins</span>
            </div>

            <div className="pilgrim-card">
              <span className="pilgrim-card-icon">🚆</span>
              <h3>From Mathura Railway Junction</h3>
              <p>
                Board an auto or taxi from Mathura Station to Vrindavan (approx. 30–40 mins). From Vrindavan outer entry, hop on an E-rickshaw to Nidhivan.
              </p>
              <span className="pilgrim-time-badge">⏱ ~35–40 Mins</span>
            </div>
          </div>

          <div className="pilgrim-local-tip">
            <span className="tip-star">💡</span>
            <p>
              <strong>Local Pilgrim Tip:</strong> Four-wheeler vehicles must be parked in outer municipal parking grounds (e.g. near Chattikara or Pagal Baba). E-rickshaws provide seamless, fast access right to Nidhivan Plaza.
            </p>
          </div>
        </section>

        {/* =====================================================
            MAP
            ===================================================== */}
        <section className="about-location" id="store-map-section">
          <div className="about-location-heading">
            <div>
              <p className="about-eyebrow">
                INTERACTIVE VRINDAVAN MAP
              </p>

              <h2>
                Find our store
                <br />
                <em>in Nidhivan Plaza.</em>
              </h2>
            </div>

            <p>
              Pinpoint our exact entrance inside Nidhivan Plaza using the interactive map. We look forward to welcoming you to Sri Vrindavan Dham!
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

          <div className="about-map-actions">
            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="about-map-link"
            >
              Open in Google Maps App <span>→</span>
            </a>
            <a
              href={WHATSAPP_MAIN}
              target="_blank"
              rel="noopener noreferrer"
              className="about-map-wa-link"
            >
              Need Live Location Pin on WhatsApp? 💬
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default About;