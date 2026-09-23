import { useState } from "react";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";

import "./Help.css";

const faqs = [
  {
    category: "Sizing & Fit",
    items: [
      {
        q: "How do I choose the correct size for a Gopi Dress?",
        a: "Our Gopi Dresses feature an adjustable drawstring (dori) waist on the lehenga skirt and comfortable blouse tailoring with inner margins. Blouse sizes correspond to standard bust measurements (S: 34-36, M: 38, L: 40, XL: 42, XXL: 44). If you need custom sizing for parikrama or temple service, you can WhatsApp us your exact measurements!",
      },
      {
        q: "What sizes are available for Dhoti Kurta sets?",
        a: "Dhoti Kurtas are available from size 36 to 46. The dhotis are ready-to-wear with adjustable drawstrings or traditional free-size unstitched 4-meter pure cotton dhotis with elegant golden borders.",
      },
      {
        q: "Are children's devotional clothing sizes available?",
        a: "Yes! We specialize in Gopi Dresses and devotional T-shirts for children and toddlers of all ages. Contact us directly to specify the child's age or height.",
      },
    ],
  },
  {
    category: "Delivery & Shipping",
    items: [
      {
        q: "How long does domestic shipping take across India?",
        a: "Orders dispatched from Vrindavan reach Delhi NCR and Uttar Pradesh within 2 to 3 days. Most other Indian metro cities and towns receive delivery within 4 to 6 business days. Express courier dispatch is available upon request.",
      },
      {
        q: "Do you ship internationally to devotees and temples abroad?",
        a: "Yes! We regularly ship to ISKCON centers and individual devotees in the United States, United Kingdom, Canada, Australia, Mauritius, South Africa, and Europe via international courier partners.",
      },
      {
        q: "What payment methods are accepted?",
        a: "We accept secure prepaid payments via UPI (Google Pay, PhonePe, Paytm, BHIM) and online payment transfers for all orders across India and abroad.",
      },
    ],
  },
  {
    category: "Wholesale & Temple Inquiries",
    items: [
      {
        q: "How can temples and shops order in wholesale?",
        a: "We supply festive attire, deity pujari uniforms, and gift shop stocks to ISKCON temples across India. For wholesale pricing (orders of 10+ pieces), contact Haridas Agrawal directly at +91 6397972342.",
      },
      {
        q: "Can we order matching sets for kirtan groups or festivals?",
        a: "Yes! We provide matching color themes (such as saffron, yellow, maroon, and white) for Janmashtami, Radhashtami, Kartik, and congregational kirtan groups.",
      },
    ],
  },
  {
    category: "Fabric Care & Washing",
    items: [
      {
        q: "How should I wash handloom cotton and printed dupattas?",
        a: "For pure cotton and hand-block prints, we recommend a gentle cold water hand wash with mild liquid detergent. Dry in shade to maintain color vibrancy. Do not tumble dry or bleach.",
      },
      {
        q: "How to maintain devotional silk and zari borders?",
        a: "Silk blend pieces and outfits with golden zari work should be dry cleaned or delicately hand-steamed on the reverse side to protect the sacred luster.",
      },
    ],
  },
];

function Help() {
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (categoryIndex, itemIndex) => {
    const key = `${categoryIndex}-${itemIndex}`;
    setOpenItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <>
      <Navbar />

      <main className="help-page">
        <div className="help-container">
          <div className="help-header">
            <span className="help-eyebrow">CUSTOMER SUPPORT · VRINDAVAN</span>
            <h1>Help & Devotee FAQ</h1>
            <p>
              Find guidance on sizing, delivery timelines, fabric care, and how to place bulk temple orders. We are here to assist your devotional journey.
            </p>
          </div>

          {/* Quick Contact Banner */}
          <div className="help-contact-banner">
            <div className="contact-banner-card">
              <span className="contact-card-icon">📞</span>
              <div>
                <h4>Call Store Directly</h4>
                <p>Haridas Agrawal: <a href="tel:+916397972342">+91 6397972342</a></p>
                <p>Vaibhav Agrawal: <a href="tel:+918533804168">+91 8533804168</a></p>
              </div>
            </div>

            <div className="contact-banner-card">
              <span className="contact-card-icon">💬</span>
              <div>
                <h4>WhatsApp Assistance</h4>
                <p>9:00 AM – 10:00 PM Every Day</p>
                <a
                  href="https://wa.me/918533804168?text=Hare%20Krishna!%20I%20have%20an%20inquiry%20regarding%20Yamuna%20Store%20clothing."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whatsapp-link"
                >
                  Chat with us on WhatsApp →
                </a>
              </div>
            </div>
          </div>

          {/* FAQ Sections */}
          <div className="help-faq-content">
            {faqs.map((cat, catIdx) => (
              <section key={cat.category} className="help-faq-category">
                <h2>{cat.category}</h2>

                <div className="faq-items-list">
                  {cat.items.map((item, itemIdx) => {
                    const isOpen = Boolean(openItems[`${catIdx}-${itemIdx}`]);
                    return (
                      <div
                        key={item.q}
                        className={`faq-item ${isOpen ? "open" : ""}`}
                        onClick={() => toggleItem(catIdx, itemIdx)}
                      >
                        <div className="faq-question">
                          <h3>{item.q}</h3>
                          <span className="faq-toggle-icon">{isOpen ? "−" : "+"}</span>
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
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default Help;
