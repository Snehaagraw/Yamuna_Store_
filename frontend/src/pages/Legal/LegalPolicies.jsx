import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";
import "./LegalPolicies.css";

const POLICIES = [
  {
    id: "refund",
    slug: "refund-policy",
    label: "Refund & Cancellation",
    icon: "🔄",
    title: "Return, Refund & Cancellation Policy",
    subtitle: "Transparent, fair, and devotee-friendly guidelines for returns and refunds.",
  },
  {
    id: "shipping",
    slug: "shipping-policy",
    label: "Shipping & Delivery",
    icon: "📦",
    title: "Shipping & Delivery Policy",
    subtitle: "Reliable Pan-India delivery via India Post & global dispatch via DHL Express.",
  },
  {
    id: "terms",
    slug: "terms-and-conditions",
    label: "Terms & Conditions",
    icon: "📜",
    title: "Terms and Conditions",
    subtitle: "Standard terms of service governing orders and use of Yamuna Store.",
  },
  {
    id: "privacy",
    slug: "privacy-policy",
    label: "Privacy Policy",
    icon: "🔒",
    title: "Privacy & Data Protection Policy",
    subtitle: "How we protect your personal information, addresses, and payment security.",
  },
  {
    id: "contact",
    slug: "contact-us",
    label: "Contact & Grievances",
    icon: "📍",
    title: "Contact Us & Grievance Redressal",
    subtitle: "Direct reach to our Vrindavan Dham atelier sevaks and support team.",
  },
];

export default function LegalPolicies({ initialTab }) {
  const location = useLocation();

  // Determine active tab based on prop, path or query
  const getTabFromPath = () => {
    if (initialTab) return initialTab;
    const path = location.pathname.toLowerCase();
    if (path.includes("refund")) return "refund";
    if (path.includes("shipping")) return "shipping";
    if (path.includes("terms")) return "terms";
    if (path.includes("privacy")) return "privacy";
    if (path.includes("contact")) return "contact";
    return "refund"; // default
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath());

  useEffect(() => {
    setActiveTab(getTabFromPath());
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname, initialTab]);

  return (
    <div className="legal-page">
      <Navbar />

      <main className="legal-main">
        {/* Header */}
        <section className="legal-hero">
          <div className="legal-hero-inner">
            <span className="legal-eyebrow">
              ॥ श्री राधेश्याम ॥ · STORE POLICIES & CUSTOMER ASSURANCE
            </span>
            <h1>Customer Protection & Legal Policies</h1>
            <p>
              Clear, transparent policies for our worldwide devotional community.
              Compliant with Indian E-Commerce Rules and Razorpay merchant standards.
            </p>
          </div>
        </section>

        {/* Tab Navigation */}
        <div className="legal-tabs-wrapper">
          <div className="legal-tabs-bar" role="tablist">
            {POLICIES.map((policy) => (
              <button
                key={policy.id}
                type="button"
                role="tab"
                aria-selected={activeTab === policy.id}
                className={`legal-tab-btn ${activeTab === policy.id ? "active" : ""}`}
                onClick={() => setActiveTab(policy.id)}
              >
                <span className="tab-icon">{policy.icon}</span>
                <span className="tab-label">{policy.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Policy Content Body */}
        <section className="legal-body-container">
          {/* 1. REFUND & CANCELLATION */}
          {activeTab === "refund" && (
            <article className="policy-card">
              <div className="policy-card-header">
                <span className="policy-badge">Last Updated: October 2026</span>
                <h2>Return, Refund & Cancellation Policy</h2>
                <p className="policy-card-sub">
                  At Yamuna Store, we treat every garment as sacred seva. We want you to feel complete peace of mind with every order.
                </p>
              </div>

              <div className="policy-section">
                <h3>1. Return & Exchange Window (7 Days)</h3>
                <p>
                  Customers may request a return or exchange within <strong>7 days from the date of parcel delivery</strong> for unworn, unused garments. The item must be in its original packaging with tags intact.
                </p>
                <p>
                  If you ordered an incorrect size for a Gopi Dress, Dhoti Kurta, or Kurti set, we gladly offer size exchanges subject to stock availability.
                </p>
              </div>

              <div className="policy-section">
                <h3>2. Damaged, Defective or Incorrect Items</h3>
                <p>
                  In the rare event that your package arrives damaged during transit, has a manufacturing defect, or an incorrect item was dispatched, please notify us within <strong>48 hours of delivery</strong>.
                </p>
                <p>
                  You can reach our team via WhatsApp at <strong>+91 8533804168</strong> or email at <strong>agrawaljii31415@gmail.com</strong> with photos of the parcel and item. We will arrange an immediate free replacement or process a 100% full refund.
                </p>
              </div>

              <div className="policy-section highlight-box">
                <h3>3. Refund Processing & Timelines (5–7 Business Days)</h3>
                <p>
                  Once your returned package is received and inspected at our Vrindavan Dham atelier (typically within 1–2 business days of receipt):
                </p>
                <ul>
                  <li>
                    <strong>Mode of Refund:</strong> Refunds will be credited directly back to the <strong>original source of payment</strong> (Credit Card, Debit Card, Net Banking, or UPI through Razorpay). For bank wire payments, the refund will be remitted to your originating bank account.
                  </li>
                  <li>
                    <strong>Credit Timeline:</strong> Approved refunds will reflect in your bank account or payment method within <strong>5 to 7 business days</strong>, depending on your bank's clearing cycle.
                  </li>
                  <li>
                    You will receive confirmation via email / SMS as soon as the refund transaction is initiated.
                  </li>
                </ul>
              </div>

              <div className="policy-section">
                <h3>4. Order Cancellation Policy</h3>
                <p>
                  You may cancel your order at any time <strong>prior to parcel dispatch</strong> by contacting our support team or WhatsApp helpline. If payment has already been captured, a 100% full refund will be initiated immediately.
                </p>
                <p>
                  Once an order has been consecrated, packed, and handed over to India Post or DHL Express, it cannot be intercepted in transit. However, you may initiate a return upon receipt as outlined in our 7-day return policy.
                </p>
              </div>

              <div className="policy-section">
                <h3>5. Non-Returnable Items</h3>
                <p>
                  Custom-tailored temple deity outfits crafted specifically to individual deity measurements and items subjected to personal wear, alteration, or perfume are non-returnable unless defective.
                </p>
              </div>
            </article>
          )}

          {/* 2. SHIPPING & DELIVERY */}
          {activeTab === "shipping" && (
            <article className="policy-card">
              <div className="policy-card-header">
                <span className="policy-badge">Carrier Partners: India Post & DHL</span>
                <h2>Shipping & Delivery Policy</h2>
                <p className="policy-card-sub">
                  Every order is packed with reverence in Sri Vrindavan Dham and dispatched with secure tracking.
                </p>
              </div>

              <div className="policy-section">
                <h3>1. Order Processing Time</h3>
                <p>
                  All in-stock orders are carefully checked, packed, and handed over to our logistics partners within <strong>24 to 48 business hours</strong> from our Vrindavan store (Monday through Sunday).
                </p>
              </div>

              <div className="policy-section">
                <h3>2. Domestic Shipping (Pan-India)</h3>
                <div className="shipping-grid">
                  <div className="shipping-col">
                    <h4>Carrier</h4>
                    <p><strong>India Post Speed Post</strong> & Express Courier Partners</p>
                  </div>
                  <div className="shipping-col">
                    <h4>Delhi NCR & UP</h4>
                    <p><strong>2 – 3 Business Days</strong></p>
                  </div>
                  <div className="shipping-col">
                    <h4>Rest of India</h4>
                    <p><strong>4 – 6 Business Days</strong></p>
                  </div>
                </div>
                <p>
                  Shipping charges are calculated fairly at checkout based on cumulative parcel weight slabs according to postal carrier tariffs.
                </p>
              </div>

              <div className="policy-section">
                <h3>3. International Shipping (Worldwide Express)</h3>
                <div className="shipping-grid">
                  <div className="shipping-col">
                    <h4>Carrier</h4>
                    <p><strong>DHL Express Priority</strong> & International EMS</p>
                  </div>
                  <div className="shipping-col">
                    <h4>Global Coverage</h4>
                    <p>50+ Countries (USA, UK, Canada, Australia, Europe, etc.)</p>
                  </div>
                  <div className="shipping-col">
                    <h4>Estimated Transit</h4>
                    <p><strong>6 – 10 Business Days</strong></p>
                  </div>
                </div>
                <p>
                  All international parcels carry full air-waybill documentation, customs declarations, and step-by-step global tracking.
                </p>
              </div>

              <div className="policy-section">
                <h3>4. Parcel Tracking</h3>
                <p>
                  Immediately upon carrier handover, you will receive a parcel tracking number and live tracking link via SMS, WhatsApp, and email so you can monitor your sacred package at every checkpoint.
                </p>
              </div>
            </article>
          )}

          {/* 3. TERMS & CONDITIONS */}
          {activeTab === "terms" && (
            <article className="policy-card">
              <div className="policy-card-header">
                <span className="policy-badge">Effective Date: October 2026</span>
                <h2>Terms and Conditions</h2>
                <p className="policy-card-sub">
                  Please review the terms and conditions that govern your access to and purchases from Yamuna Store.
                </p>
              </div>

              <div className="policy-section">
                <h3>1. About Yamuna Store</h3>
                <p>
                  Yamuna Store is a registered proprietary business founded in 2014, operating its physical atelier inside Nidhivan Plaza, Near Nidhivan Temple, Sri Vrindavan Dham, Mathura — 281121, Uttar Pradesh, India.
                </p>
              </div>

              <div className="policy-section">
                <h3>2. Product Authenticity & Handloom Variations</h3>
                <p>
                  All devotional garments, Gopi dresses, dhotis, and kurtis are crafted using traditional Indian textile methods. Because many prints feature genuine hand-block printing and handloom weaving, subtle variations in color, motif alignment, or weave texture are natural hallmarks of authentic artisan craft, not manufacturing defects.
                </p>
              </div>

              <div className="policy-section">
                <h3>3. Pricing & Currency Conversion</h3>
                <p>
                  All retail prices on the website are denominated in Indian Rupees (INR) and include all applicable taxes. Currency conversions displayed via our currency widget (USD, EUR, GBP, AUD, CAD) are real-time indicative approximations to assist international devotees; final domestic checkout settlements are processed in INR through Razorpay.
                </p>
              </div>

              <div className="policy-section">
                <h3>4. Payment Terms</h3>
                <p>
                  Domestic payments are processed securely through Razorpay using UPI, debit/credit cards, and net banking. For international wire transfers, orders are confirmed upon credit verification in our designated commercial bank account.
                </p>
              </div>

              <div className="policy-section">
                <h3>5. Intellectual Property</h3>
                <p>
                  All imagery, logos, brand names, product photography, and written text on this website are the intellectual property of Yamuna Store Vrindavan. Unauthorized reproduction or commercial use without prior written consent is strictly prohibited.
                </p>
              </div>

              <div className="policy-section">
                <h3>6. Governing Law & Jurisdiction</h3>
                <p>
                  These Terms of Service and any transactional disputes arising out of the purchase of products shall be governed by the laws of India and subject to the exclusive jurisdiction of the competent courts in <strong>Mathura, Uttar Pradesh, India</strong>.
                </p>
              </div>
            </article>
          )}

          {/* 4. PRIVACY POLICY */}
          {activeTab === "privacy" && (
            <article className="policy-card">
              <div className="policy-card-header">
                <span className="policy-badge">Privacy Commitment</span>
                <h2>Privacy & Data Protection Policy</h2>
                <p className="policy-card-sub">
                  Yamuna Store respects your privacy and is dedicated to safeguarding your personal information.
                </p>
              </div>

              <div className="policy-section">
                <h3>1. Information We Collect</h3>
                <p>
                  To fulfill your devotional orders and provide personalized support, we collect:
                </p>
                <ul>
                  <li><strong>Contact Details:</strong> Full name, email address, contact phone number, and country dial code.</li>
                  <li><strong>Delivery Information:</strong> Complete street address, city, state, postal code, and country for parcel dispatch.</li>
                  <li><strong>Order History:</strong> Record of items purchased, dates, and order numbers to manage exchanges and customer support.</li>
                </ul>
              </div>

              <div className="policy-section highlight-box">
                <h3>2. Payment Security & Financial Data</h3>
                <p>
                  <strong>We do NOT store or have access to your credit/debit card numbers, CVVs, net banking credentials, or UPI PINs.</strong>
                </p>
                <p>
                  All electronic transactions are processed through <strong>Razorpay</strong>, an RBI-authorized, PCI-DSS Level 1 compliant payment gateway using end-to-end 256-bit SSL encryption.
                </p>
              </div>

              <div className="policy-section">
                <h3>3. How We Use Your Information</h3>
                <p>
                  Your information is strictly used to:
                </p>
                <ul>
                  <li>Process, assemble, and dispatch your order from Vrindavan Dham.</li>
                  <li>Share consignment addresses with India Post or DHL Express for doorstep delivery.</li>
                  <li>Send SMS, WhatsApp, or email notifications with your tracking details.</li>
                  <li>Respond to your sizing, custom tailoring, or wholesale inquiries.</li>
                </ul>
              </div>

              <div className="policy-section">
                <h3>4. Zero Third-Party Selling</h3>
                <p>
                  We treat our customers as an extended spiritual family. We will never sell, trade, or rent your personal data to third-party telemarketers or advertising networks.
                </p>
              </div>

              <div className="policy-section">
                <h3>5. Customer Rights & Profile Updates</h3>
                <p>
                  You can review, edit, or delete your saved address details at any time by logging into your account under <Link to="/account">My Account</Link>. To request complete account erasure, simply contact our grievance desk.
                </p>
              </div>
            </article>
          )}

          {/* 5. CONTACT & GRIEVANCES */}
          {activeTab === "contact" && (
            <article className="policy-card">
              <div className="policy-card-header">
                <span className="policy-badge">Direct Sevak Support</span>
                <h2>Contact Us & Grievance Redressal</h2>
                <p className="policy-card-sub">
                  We are physically present in Sri Vrindavan Dham 365 days a year to assist you.
                </p>
              </div>

              <div className="contact-details-grid">
                <div className="contact-info-card">
                  <span className="contact-info-icon">📍</span>
                  <h4>Physical Store Address</h4>
                  <p>
                    <strong>Yamuna Store</strong><br />
                    Inside Nidhivan Plaza, Near Nidhivan Temple<br />
                    Sri Vrindavan Dham — 281121<br />
                    Mathura, Uttar Pradesh, India
                  </p>
                  <Link to="/about#store-map-section" className="policy-link-btn">
                    View Google Map & Directions →
                  </Link>
                </div>

                <div className="contact-info-card">
                  <span className="contact-info-icon">📞</span>
                  <h4>Direct Sevak Phone & WhatsApp</h4>
                  <p>
                    <strong>Haridas Agrawal:</strong>{" "}
                    <a href="tel:+916397972342">+91 6397972342</a>
                  </p>
                  <p>
                    <strong>Vaibhav Agrawal:</strong>{" "}
                    <a href="tel:+918533804168">+91 8533804168</a>
                  </p>
                  <p>
                    <strong>Email:</strong>{" "}
                    <a href="mailto:agrawaljii31415@gmail.com">agrawaljii31415@gmail.com</a>
                  </p>
                  <small>Hours: Mon – Sun: 9:00 AM – 10:00 PM IST</small>
                </div>

                <div className="contact-info-card full-width">
                  <span className="contact-info-icon">🛡️</span>
                  <h4>Grievance Officer (Consumer Protection)</h4>
                  <p>
                    In accordance with the Information Technology Act, 2000 and the Consumer Protection (E-Commerce) Rules, 2020:
                  </p>
                  <p>
                    <strong>Grievance Officer:</strong> Haridas Agrawal<br />
                    <strong>Designation:</strong> Proprietor, Yamuna Store<br />
                    <strong>Address:</strong> Inside Nidhivan Plaza, Vrindavan, Mathura, UP 281121<br />
                    <strong>Email:</strong> agrawaljii31415@gmail.com | <strong>Mobile:</strong> +91 6397972342
                  </p>
                  <small>Grievances are acknowledged within 48 hours and resolved within 30 days.</small>
                </div>
              </div>
            </article>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
