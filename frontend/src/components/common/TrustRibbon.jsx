import "../../styles/trustRibbon.css";

const TRUST_PILLARS = [
  {
    id: "vrindavan-crafting",
    icon: "🌸",
    badge: "SRI VRINDAVAN DHAM",
    title: "Sacred Handlooms",
    desc: "Pure natural cottons, ceremonial silks, and consecrated stitching made with spiritual sanctity in Sri Vrindavan Dham.",
    highlight: "Direct from Sri Dham",
  },
  {
    id: "pan-india-dhl",
    icon: "✈️",
    badge: "PAN-INDIA & WORLDWIDE",
    title: "India Post & DHL Express",
    desc: "Doorstep delivery across all Indian postal pin codes & secure worldwide courier to devotees in 50+ countries.",
    highlight: "Domestic & Global Delivery",
  },
  {
    id: "weight-shipping",
    icon: "⚖️",
    badge: "TRANSPARENT TARIFFS",
    title: "Weight-Based Shipping",
    desc: "Automated fair shipping rates calculated transparently by parcel weight and delivery destination at checkout.",
    highlight: "Zero Hidden Markups",
  },
  {
    id: "whatsapp-care",
    icon: "💬",
    badge: "DEVOTEE SIZING CARE",
    title: "1-on-1 WhatsApp Guidance",
    desc: "Need darshan attire advice, custom blouse margins, or parikrama fit guidance? Speak directly with our Dham sevaks.",
    highlight: "Chat with Store Sevaks",
    isWhatsApp: true,
    href: "https://wa.me/918533804168?text=Radhe%20Radhe!%20I%20would%20like%20guidance%20regarding%20devotional%20attire%20and%20sizing.",
  },
];

function TrustRibbon() {
  return (
    <section
      className="trust-ribbon-section"
      aria-label="Yamuna Store Authenticity and Devotional Guarantees"
    >
      <div className="trust-ribbon-container">
        <div className="trust-ribbon-header">
          <span className="trust-ribbon-om">॥ श्री राधेश्याम ॥</span>
          <span className="trust-ribbon-title">
            THE YAMUNA STORE PROMISE · ROOTED IN VRINDAVAN SEVA
          </span>
        </div>

        <div className="trust-ribbon-grid">
          {TRUST_PILLARS.map((pillar) => {
            const ContentWrapper = pillar.isWhatsApp ? "a" : "div";
            const wrapperProps = pillar.isWhatsApp
              ? {
                  href: pillar.href,
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "trust-pillar-card trust-pillar-link",
                  "aria-label": `${pillar.title} - Chat on WhatsApp`,
                }
              : {
                  className: "trust-pillar-card",
                };

            return (
              <ContentWrapper key={pillar.id} {...wrapperProps}>
                <div className="trust-pillar-icon-box" aria-hidden="true">
                  <span className="trust-pillar-icon">{pillar.icon}</span>
                </div>
                <div className="trust-pillar-body">
                  <span className="trust-pillar-badge">{pillar.badge}</span>
                  <h3 className="trust-pillar-heading">{pillar.title}</h3>
                  <p className="trust-pillar-desc">{pillar.desc}</p>
                  <span className="trust-pillar-highlight">
                    {pillar.highlight} {pillar.isWhatsApp ? "💬 →" : "✓"}
                  </span>
                </div>
              </ContentWrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default TrustRibbon;
