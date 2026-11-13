import { useState } from "react";
import { Link } from "react-router-dom";
import "./Connect.css";

const STORE_DETAILS = {
  name: "Yamuna Store Vrindavan",
  tagline: "Manufacturer & Supplier of Devotional Clothing",
  blessing: "॥ श्री राधेश्याम ॥",
  websiteUrl: "https://yamunastore.com",
  instagramUrl: "https://www.instagram.com/yamuna_store_vrindavan/",
  whatsappUrl:
    "https://api.whatsapp.com/send/?phone=918533804168&text=Radhe%20Radhe!%20I%20scanned%20your%20business%20card%20and%20would%20like%20to%20inquire%20about%20your%20devotional%20clothing.",
  facebookUrl: "https://www.facebook.com/share/1H392atmQM/",
  mapsUrl:
    "https://www.google.com/maps/place/Yamuna+Store/@27.5833414,77.6950589,17z/data=!3m1!4b1!4m6!3m5!1s0x39736e351a126c33:0x2d7091d2212b9698!8m2!3d27.5833367!4d77.6976338!16s%2Fg%2F11hbfhhtsn?entry=ttu",
  email: "yamunastore.com@gmail.com",
  contacts: [
    { name: "Vaibhav Agrawal", phone: "+91 8533804168", rawPhone: "918533804168" },
    { name: "Haridas Agrawal", phone: "+91 6397972342", rawPhone: "916397972342" },
  ],
  address: "Inside Nidhivan Plaza, near Nidhivan Temple, Vrindavan, 281121, Uttar Pradesh, India",
};

export default function Connect() {
  const [copied, setCopied] = useState(false);

  // Generate and download a standard vCard (.vcf) so the customer can save the contact to phone
  const handleDownloadVCard = () => {
    const vCardData = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      "FN:Yamuna Store Vrindavan",
      "ORG:Yamuna Store",
      "TITLE:Devotional Clothing Manufacturer & Supplier",
      "TEL;TYPE=WORK,VOICE:+918533804168",
      "TEL;TYPE=CELL,VOICE:+916397972342",
      "EMAIL;TYPE=INTERNET:yamunastore.com@gmail.com",
      "URL:https://yamunastore.com",
      "ADR;TYPE=WORK:;;Inside Nidhivan Plaza, Near Nidhivan Temple;Vrindavan;Uttar Pradesh;281121;India",
      "NOTE:Traditional Devotional Clothing from Sri Dham Vrindavan | Instagram: @yamuna_store_vrindavan",
      "END:VCARD",
    ].join("\r\n");

    const blob = new Blob([vCardData], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Yamuna_Store_Vrindavan.vcf");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Native share or clipboard copy
  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Yamuna Store Vrindavan",
          text: "Connect with Yamuna Store - Traditional Devotional Clothing from Vrindavan Dham",
          url: shareUrl,
        });
      } catch {
        // User dismissed share
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {
        // clipboard fallback
      }
    }
  };

  return (
    <div className="connect-page-wrap">
      {/* Background Decorative Ambience */}
      <div className="connect-bg-glow" />

      <main className="connect-card-container">
        {/* Top Header Card */}
        <header className="connect-header-card">
          <div className="connect-blessing-pill">{STORE_DETAILS.blessing}</div>

          <div className="connect-brand-avatar">
            <span className="connect-avatar-letter">य</span>
          </div>

          <h1 className="connect-brand-title">Yamuna Store</h1>
          <p className="connect-brand-location">VRINDAVAN DHAM</p>
          <p className="connect-brand-tagline">{STORE_DETAILS.tagline}</p>

          <div className="connect-trust-tags">
            <span>🌸 Sri Dham Vrindavan</span>
            <span>📦 Pan-India & Global Delivery</span>
          </div>
        </header>

        {/* Action Links Deck */}
        <section className="connect-actions-deck" aria-label="Official Links">
          {/* 1. Official Store Website */}
          <a
            href={STORE_DETAILS.websiteUrl}
            className="connect-link-tile primary-tile"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="tile-icon-box website-icon-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                <path d="M2 12h20" />
              </svg>
            </div>
            <div className="tile-text">
              <strong>Official Online Store</strong>
              <small>Explore Gopi Dresses, Sarees, Dhoti Kurtas & more</small>
            </div>
            <span className="tile-arrow">→</span>
          </a>

          {/* 2. Instagram Profile */}
          <a
            href={STORE_DETAILS.instagramUrl}
            className="connect-link-tile instagram-tile"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="tile-icon-box instagram-icon-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </div>
            <div className="tile-text">
              <strong>Instagram (@yamuna_store_vrindavan)</strong>
              <small>Daily devotee reels, sacred collections & stories</small>
            </div>
            <span className="tile-arrow">→</span>
          </a>

          {/* 3. WhatsApp Direct Chat */}
          <a
            href={STORE_DETAILS.whatsappUrl}
            className="connect-link-tile whatsapp-tile"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="tile-icon-box whatsapp-icon-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.5 11.5a8.5 8.5 0 0 1-12.6 7.4L3.5 20.5l1.7-4.2A8.5 8.5 0 1 1 20.5 11.5Z" />
                <path d="M8.8 8.5c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.7c.1.2.1.4-.1.6l-.6.7c.7 1.2 1.7 2.2 2.9 2.9l.7-.6c.2-.2.4-.2.6-.1l1.7.7c.3.1.4.3.4.5v.5c0 .3 0 .5-.4.7-.4.2-1.1.3-1.7.1-1.1-.3-2.5-1.1-3.8-2.4-1.3-1.3-2.1-2.7-2.4-3.8-.2-.6-.1-1.3.3-1.7Z" />
              </svg>
            </div>
            <div className="tile-text">
              <strong>Chat on WhatsApp</strong>
              <small>Instant sizing help, bulk pricing & order assistance</small>
            </div>
            <span className="tile-arrow">→</span>
          </a>

          {/* 4. Google Maps Location */}
          <a
            href={STORE_DETAILS.mapsUrl}
            className="connect-link-tile maps-tile"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="tile-icon-box maps-icon-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div className="tile-text">
              <strong>Visit Our Vrindavan Store</strong>
              <small>Inside Nidhivan Plaza, Near Nidhivan Temple</small>
            </div>
            <span className="tile-arrow">→</span>
          </a>

          {/* 5. Facebook Page */}
          <a
            href={STORE_DETAILS.facebookUrl}
            className="connect-link-tile facebook-tile"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="tile-icon-box facebook-icon-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </div>
            <div className="tile-text">
              <strong>Facebook Page</strong>
              <small>Devotee updates, reviews & announcements</small>
            </div>
            <span className="tile-arrow">→</span>
          </a>

          {/* 6. Direct Phone Call Buttons */}
          <div className="connect-contacts-grid">
            <a href="tel:+918533804168" className="connect-contact-btn">
              <span className="contact-btn-icon">📞</span>
              <div className="contact-btn-info">
                <strong>Vaibhav Agrawal</strong>
                <span>+91 8533804168</span>
              </div>
            </a>

            <a href="tel:+916397972342" className="connect-contact-btn">
              <span className="contact-btn-icon">📞</span>
              <div className="contact-btn-info">
                <strong>Haridas Agrawal</strong>
                <span>+91 6397972342</span>
              </div>
            </a>
          </div>

          {/* 7. Save to Contacts (vCard) */}
          <button
            type="button"
            className="connect-vcard-btn"
            onClick={handleDownloadVCard}
          >
            <span className="vcard-btn-icon">💾</span>
            <span>Save Yamuna Store to Phone Contacts</span>
          </button>
        </section>

        {/* Store Info Footer Card */}
        <footer className="connect-footer-card">
          <div className="connect-address-block">
            <strong>📍 Store Address:</strong>
            <p>{STORE_DETAILS.address}</p>
          </div>

          <div className="connect-email-block">
            <strong>✉️ Email:</strong>{" "}
            <a href={`mailto:${STORE_DETAILS.email}`}>{STORE_DETAILS.email}</a>
          </div>

          <div className="connect-footer-actions">
            <button
              type="button"
              className="connect-share-btn"
              onClick={handleShare}
            >
              🔗 {copied ? "Link Copied!" : "Share Digital Card"}
            </button>

            <Link to="/" className="connect-home-link">
              ← Return to Main Store
            </Link>
          </div>

          <p className="connect-copyright">
            © {new Date().getFullYear()} Yamuna Store. Sacred Vrindavan Devotional Clothing.
          </p>
        </footer>
      </main>
    </div>
  );
}
