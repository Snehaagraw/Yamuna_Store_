import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";

import "./Help.css";

const FAQ_DATA = [
  {
    category: "Sizing & Fit",
    icon: "🌸",
    items: [
      {
        q: "How do I choose the correct size for a Gopi Dress?",
        a: "Our Gopi Dresses feature an adjustable drawstring (dori) waist on the lehenga skirt that easily fits waist sizes 26 to 44 inches. The blouse is tailored with 2-inch inner side margins so it can be easily loosened or tightened. Sizes correspond to standard bust measurements (S: 34-36, M: 38, L: 40, XL: 42, XXL: 44). For custom lengths or temple seva fittings, you can WhatsApp us your exact measurements!",
      },
      {
        q: "What sizes are available for Dhoti Kurta sets?",
        a: "Men's Dhoti Kurta sets are available from chest size 36 to 46 inches. We offer both pre-stitched ready-to-wear dhotis with comfortable elastic/drawstring waists, as well as classic unstitched 4-meter pure handloom cotton dhotis with traditional golden zari borders.",
      },
      {
        q: "Can I order custom sizes or sizes for children and toddlers?",
        a: "Yes, definitely! We lovingly tailor deity dresses, boys' dhoti kurtas, and girls' Gopi dresses for toddlers and children from ages 1 to 14. Message us on WhatsApp with the child's age or height for dedicated tailoring.",
      },
    ],
  },
  {
    category: "Shipping & Delivery",
    icon: "📦",
    items: [
      {
        q: "How does Pan-India domestic shipping work?",
        a: "All domestic orders are carefully packed in Vrindavan Dham and dispatched within 24–48 hours via India Post Speed Post and express courier partners. Delivery takes 2–3 business days for Delhi NCR & UP, and 4–6 business days for the rest of India with live SMS/email tracking.",
      },
      {
        q: "Do you ship internationally via DHL Express?",
        a: "Yes! We proudly ship sacred attire worldwide to individual devotees, yoga centers, and ISKCON temples in the USA, UK, Canada, Australia, Europe, South Africa, Mauritius, and over 50 countries via DHL Express and international priority couriers. International delivery typically takes 6–10 business days.",
      },
      {
        q: "How are shipping charges calculated by product weight?",
        a: "To ensure absolute fairness, our checkout system calculates exact shipping charges based on the cumulative weight of your parcel. Lighter items (like dupattas) incur minimal shipping, while heavier parcels (such as multiple embroidered lehengas) are billed strictly according to carrier weight slabs.",
      },
    ],
  },
  {
    category: "Payments & Orders",
    icon: "💳",
    items: [
      {
        q: "What payment methods do you accept?",
        a: "We accept all secure online payment modes including UPI (Google Pay, PhonePe, Paytm, BHIM), NetBanking, Credit/Debit Cards, and international card payments. All transactions are securely encrypted.",
      },
      {
        q: "Can international customers view prices in their own currency?",
        a: "Yes! Use our floating currency widget located on the lower right of every page. You can convert prices from Indian Rupees (₹) to USD ($), EUR (€), GBP (£), AED, CAD, or AUD in real time to see exact costs before ordering.",
      },
      {
        q: "Can I track my parcel once it leaves Vrindavan?",
        a: "Yes. As soon as your parcel is consecrated and handed to India Post or DHL, you will receive a tracking link with step-by-step dispatch updates right up to your doorstep.",
      },
    ],
  },
  {
    category: "Returns & Refunds",
    icon: "🔄",
    items: [
      {
        q: "What is your return and exchange policy?",
        a: "We offer a 7-day return and exchange policy from the date of delivery for unworn, unused garments with original tags intact. If you require a different size or fit, our team in Vrindavan will gladly assist you.",
      },
      {
        q: "How long does it take to receive a refund?",
        a: "Once your return is received and inspected at our Vrindavan atelier (typically within 1–2 business days), approved refunds are credited back to your original payment method (Bank/UPI/Card) within 5 to 7 business days.",
      },
      {
        q: "Can I cancel my order before it ships?",
        a: "Yes! You can cancel your order at any time before dispatch by contacting our WhatsApp support (+91 8533804168) or calling our sevaks. A 100% full refund will be initiated immediately.",
      },
    ],
  },
  {
    category: "Wholesale & Temple Seva",
    icon: "🛕",
    items: [
      {
        q: "How can ISKCON temples and ashrams place bulk wholesale orders?",
        a: "We supply festive attire, pujari uniforms, kirtan troupe clothing, and gift shop stocks to temples worldwide. For wholesale orders (10+ pieces), you receive dedicated bulk discounts. Contact Haridas Agrawal directly on WhatsApp or call +91 6397972342.",
      },
      {
        q: "Can we order coordinated matching attire for kirtan groups or festivals?",
        a: "Yes! We coordinate matching color palettes (such as saffron, kesariya, yellow, maroon, and white) for Janmashtami, Radhashtami, Gaura Purnima, Kartik month, and congregational padayatras.",
      },
    ],
  },
  {
    category: "Fabric Care & Sacred Sanctity",
    icon: "✨",
    items: [
      {
        q: "How should I wash and care for devotional cotton & handloom prints?",
        a: "For hand-block printed cotton and dupattas, wash gently by hand in cold water with a mild detergent. Always dry in shade to preserve sacred colors. Do not bleach or machine-tumble dry.",
      },
      {
        q: "How should I preserve silk garments and golden zari borders?",
        a: "Silk blend garments and ensembles with golden zari work should be dry cleaned or delicately hand-steamed on the reverse side. Store them in breathable cotton bags to maintain their divine luster.",
      },
    ],
  },
];

function Help() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [openItems, setOpenItems] = useState({ "0-0": true }); // First FAQ open by default

  const toggleItem = (catIdx, itemIdx) => {
    const key = `${catIdx}-${itemIdx}`;
    setOpenItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const expandAll = () => {
    const allOpen = {};
    FAQ_DATA.forEach((cat, cIdx) => {
      cat.items.forEach((_, iIdx) => {
        allOpen[`${cIdx}-${iIdx}`] = true;
      });
    });
    setOpenItems(allOpen);
  };

  const collapseAll = () => {
    setOpenItems({});
  };

  // Filtered FAQs based on category tab & search query
  const filteredFaqs = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return FAQ_DATA.map((cat, cIdx) => {
      const matchesCategory =
        activeCategory === "All" || activeCategory === cat.category;

      if (!matchesCategory) return null;

      const matchingItems = cat.items
        .map((item, iIdx) => ({ ...item, globalIndex: `${cIdx}-${iIdx}` }))
        .filter((item) => {
          if (!query) return true;
          return (
            item.q.toLowerCase().includes(query) ||
            item.a.toLowerCase().includes(query)
          );
        });

      if (matchingItems.length === 0) return null;

      return {
        ...cat,
        originalIndex: cIdx,
        items: matchingItems,
      };
    }).filter(Boolean);
  }, [activeCategory, searchQuery]);

  const totalQuestionsCount = useMemo(() => {
    return FAQ_DATA.reduce((acc, cat) => acc + cat.items.length, 0);
  }, []);

  return (
    <>
      <Navbar />

      <main className="help-page">
        <div className="help-container">
          {/* Header */}
          <div className="help-header">
            <span className="help-eyebrow">
              ॥ श्री राधेश्याम ॥ · CUSTOMER CARE & SUPPORT
            </span>
            <h1>Devotee Help Desk & FAQ</h1>
            <p>
              Guidance on size selection, India Post & DHL international shipping,
              fabric care, currency conversion, and bulk temple inquiries.
            </p>
          </div>

          {/* Quick Contact Cards */}
          <div className="help-contact-banner">
            <div className="contact-banner-card">
              <span className="contact-card-icon">📞</span>
              <div className="contact-card-body">
                <h4>Call Our Vrindavan Sevaks</h4>
                <p>
                  Haridas Agrawal:{" "}
                  <a href="tel:+916397972342">+91 6397972342</a>
                </p>
                <p>
                  Vaibhav Agrawal:{" "}
                  <a href="tel:+918533804168">+91 8533804168</a>
                </p>
                <small>Mon – Sun: 9:00 AM – 9:30 PM IST</small>
              </div>
            </div>

            <div className="contact-banner-card highlight-card">
              <span className="contact-card-icon">💬</span>
              <div className="contact-card-body">
                <h4>Instant WhatsApp Assistance</h4>
                <p>Custom fittings, dispatch tracking & overseas inquiries.</p>
                <a
                  href="https://wa.me/918533804168?text=Hare%20Krishna!%20I%20have%20an%20inquiry%20regarding%20Yamuna%20Store%20clothing."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whatsapp-btn"
                >
                  Chat with Us on WhatsApp →
                </a>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="help-search-box">
            <span className="help-search-icon">🔍</span>
            <input
              type="search"
              className="help-search-input"
              placeholder="Search help topics (e.g. sizing, DHL shipping, wash care, dhoti, wholesale)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search frequently asked questions"
            />
            {searchQuery && (
              <button
                type="button"
                className="help-search-clear"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Topic Filter Pills & Controls */}
          <div className="help-filter-bar">
            <div className="help-pills-row">
              <button
                type="button"
                className={`help-pill ${activeCategory === "All" ? "active" : ""}`}
                onClick={() => setActiveCategory("All")}
              >
                <span>All Topics</span>
                <span className="pill-badge">{totalQuestionsCount}</span>
              </button>
              {FAQ_DATA.map((cat) => (
                <button
                  key={cat.category}
                  type="button"
                  className={`help-pill ${
                    activeCategory === cat.category ? "active" : ""
                  }`}
                  onClick={() => setActiveCategory(cat.category)}
                >
                  <span>
                    {cat.icon} {cat.category}
                  </span>
                  <span className="pill-badge">{cat.items.length}</span>
                </button>
              ))}
            </div>

            <div className="help-toggle-all">
              <button type="button" onClick={expandAll} className="toggle-all-btn">
                Expand All
              </button>
              <span>·</span>
              <button type="button" onClick={collapseAll} className="toggle-all-btn">
                Collapse All
              </button>
            </div>
          </div>

          {/* FAQ Accordion List */}
          <div className="help-faq-content">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((cat) => (
                <section key={cat.category} className="help-faq-category">
                  <div className="category-title-row">
                    <span className="category-icon">{cat.icon}</span>
                    <h2>{cat.category}</h2>
                  </div>

                  <div className="faq-items-list">
                    {cat.items.map((item) => {
                      const isOpen = Boolean(openItems[item.globalIndex]);
                      return (
                        <div
                          key={item.q}
                          className={`faq-item ${isOpen ? "open" : ""}`}
                          onClick={() => {
                            const [cI, iI] = item.globalIndex.split("-");
                            toggleItem(cI, iI);
                          }}
                        >
                          <div className="faq-question">
                            <h3>{item.q}</h3>
                            <span className="faq-toggle-icon">
                              {isOpen ? "−" : "+"}
                            </span>
                          </div>
                          {isOpen && (
                            <div className="faq-answer">
                              <p>{item.a}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              ))
            ) : (
              <div className="help-empty-search">
                <span className="empty-icon">🌸</span>
                <h3>No answers found for "{searchQuery}"</h3>
                <p>
                  Feel free to message our team directly on WhatsApp or call us, and
                  we will gladly answer your questions.
                </p>
                <button
                  type="button"
                  className="empty-reset-btn"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("All");
                  }}
                >
                  View All FAQ Topics
                </button>
              </div>
            )}
          </div>

          {/* Official Policy Documents Link Strip */}
          <div className="help-policies-strip">
            <h4>Official Store Policies & Customer Protection</h4>
            <div className="help-policies-links">
              <Link to="/refund-policy">Return & Refund Policy (7 Days) →</Link>
              <Link to="/shipping-policy">Shipping Policy (India Post & DHL) →</Link>
              <Link to="/terms-and-conditions">Terms & Conditions →</Link>
              <Link to="/privacy-policy">Privacy & Payment Security →</Link>
            </div>
          </div>

          {/* Bottom Dham Location Guidance */}
          <div className="help-footer-banner">
            <div className="footer-banner-inner">
              <span className="footer-om">॥ राधे राधे ॥</span>
              <h3>Visit Us in Sri Vrindavan Dham</h3>
              <p>
                Yamuna Store · Inside Nidhivan Plaza, Near Nidhivan Temple, Sri Vrindavan Dham, Mathura, UP, India.
              </p>
              <small>Dedicated to the service of all devotees worldwide.</small>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default Help;
