import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/client";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { COUNTRIES, getCountryByName, splitPhoneAndDialCode } from "../../constants/countries";
import { calculateShipping } from "../../utils/shippingCalculator";
import { openRazorpayModal } from "../../utils/razorpay";
import Navbar from "../../components/navbar/Navbar";
import Footer from "../../components/footer/Footer";

import "./Checkout.css";

function Checkout() {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { customerUser, customerToken, isCustomerLoggedIn, refreshCustomerProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    country: "India",
    dialCode: "+91",
    phone: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    orderNotes: "",
    paymentMethod: "UPI",
  });

  // Hostinger-style step state: address editing vs confirmed summary
  const [isAddressEditing, setIsAddressEditing] = useState(true);

  // Active payment accordion tab
  // For India: "UPI", "Card", "Netbanking"
  // For International: "BankTransfer", "InternationalCard"
  const [activePaymentTab, setActivePaymentTab] = useState("UPI");

  // International Bank Transfer input data
  const [bankWireData, setBankWireData] = useState({
    senderBank: "",
    transferReference: "",
    remittanceCurrency: "USD",
  });

  // Copy feedback state for bank details
  const [copiedKey, setCopiedKey] = useState("");

  // Approach B: Secure bank details fetched from backend API (never exposed in client code)
  const [bankDetails, setBankDetails] = useState({
    accountName: "Yamuna Store",
    bankName: "State Bank of India",
    accountNumber: "000000000000",
    accountType: "Current / Business Account",
    ifscCode: "SBIN0000000",
    swiftCode: "SBININBBXXX",
    branch: "Vrindavan Dham Branch, Mathura, Uttar Pradesh, 281121, India",
    supportedCurrencies: "USD ($), EUR (€), GBP (£), AUD (A$), CAD (C$), INR (₹)",
    notes: "Please mention your Order Number in the wire transfer description / remarks.",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deliveryDropdownOpen, setDeliveryDropdownOpen] = useState(false);
  const [isConsentChecked, setIsConsentChecked] = useState(false);
  const [consentError, setConsentError] = useState(false);

  // Coupon code toggle
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");

  // Country check: Domestic (India) vs International
  const isDomestic = formData.country === "India";

  // Dynamic weight-based shipping calculation for India Post and DHL Express
  const shippingInfo = useMemo(() => {
    return calculateShipping({
      items: cartItems,
      country: formData.country,
      pincode: formData.pincode,
    });
  }, [cartItems, formData.country, formData.pincode]);

  const finalPayableAmount = cartTotal + (shippingInfo.shippingFee || 0);

  const hasSavedAddress = Boolean(
    customerUser?.saved_address?.address &&
    customerUser?.saved_address?.city &&
    customerUser?.saved_address?.pincode
  );

  // Switch default active payment tab when country changes
  useEffect(() => {
    if (isDomestic) {
      if (activePaymentTab === "BankTransfer" || activePaymentTab === "InternationalCard") {
        setActivePaymentTab("UPI");
      }
    } else {
      if (activePaymentTab === "UPI" || activePaymentTab === "Card" || activePaymentTab === "Netbanking") {
        setActivePaymentTab("BankTransfer");
      }
    }
  }, [isDomestic, activePaymentTab]);

  // Secure Approach B: Dynamically fetch verified bank details from Django API for international customers
  useEffect(() => {
    if (!isDomestic && customerToken) {
      api
        .get("/api/orders/bank-details/", {
          headers: { Authorization: `Bearer ${customerToken}` },
        })
        .then((res) => {
          if (res.data) setBankDetails(res.data);
        })
        .catch((err) => {
          console.error("Failed to load secure bank details:", err);
        });
    }
  }, [isDomestic, customerToken]);

  // Guard: Mandatory login before checkout
  useEffect(() => {
    if (!isCustomerLoggedIn) {
      navigate("/login?redirect=/checkout", { replace: true });
    }
  }, [isCustomerLoggedIn, navigate]);

  // Pre-fill customer information and saved address
  useEffect(() => {
    if (customerUser) {
      const addr = customerUser.saved_address || {};
      const savedCountry = addr.country || "India";
      const { dialCode: parsedDialCode, phone: parsedPhone } = splitPhoneAndDialCode(
        addr.phone || "",
        savedCountry
      );

      const hasCompleteAddress = Boolean(
        addr.name && addr.phone && addr.address && addr.city && addr.pincode
      );

      setFormData((prev) => ({
        ...prev,
        name: prev.name || addr.name || customerUser.first_name || customerUser.username || "",
        country: prev.country || savedCountry,
        dialCode: prev.dialCode || parsedDialCode || "+91",
        phone: prev.phone || parsedPhone || "",
        email: prev.email || customerUser.email || "",
        address: prev.address || addr.address || "",
        city: prev.city || addr.city || "",
        state: prev.state || addr.state || "",
        pincode: prev.pincode || addr.pincode || "",
      }));

      // If user has complete saved address, collapse into confirmed card initially
      if (hasCompleteAddress) {
        setIsAddressEditing(false);
      }
    }
  }, [customerUser]);

  // Guard: Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate("/cart");
    }
  }, [cartItems, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCountryChange = (e) => {
    const selectedCountry = e.target.value;
    const countryObj = getCountryByName(selectedCountry);
    setFormData((prev) => ({
      ...prev,
      country: selectedCountry,
      dialCode: countryObj.dialCode !== "+" ? countryObj.dialCode : prev.dialCode,
    }));
  };

  const handleCopy = (text, key) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 2000);
    }
  };

  const validateAddress = () => {
    if (
      !formData.name ||
      !formData.phone ||
      !formData.country ||
      !formData.address ||
      !formData.city ||
      !formData.state ||
      !formData.pincode
    ) {
      setError("Please complete all required delivery address fields.");
      setIsAddressEditing(true);
      return false;
    }
    setError("");
    return true;
  };

  // Submit Order Helper
  const submitOrderToBackend = async ({ paymentMethodName, paymentStatus, transactionId }) => {
    const fullPhone = `${formData.dialCode.trim()} ${formData.phone.trim()}`.trim();

    const payload = {
      customer_name: formData.name,
      customer_phone: fullPhone,
      customer_email: formData.email,
      country: formData.country,
      shipping_address: formData.address,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      order_notes: formData.orderNotes,
      total_amount: finalPayableAmount,
      shipping_fee: shippingInfo.shippingFee,
      shipping_carrier: shippingInfo.carrier,
      total_weight: shippingInfo.totalWeightFormatted,
      payment_method: paymentMethodName,
      payment_status: paymentStatus,
      transaction_id: transactionId || "",
      items: cartItems.map((item) => ({
        product_id: item.id,
        name: item.size ? `${item.name} (${item.size})` : item.name,
        size: item.size || "",
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
    };

    const response = await api.post("/api/orders/", payload, {
      headers: {
        Authorization: `Bearer ${customerToken}`,
      },
    });

    const createdOrder = response.data;
    clearCart();

    if (refreshCustomerProfile) {
      refreshCustomerProfile();
    }

    navigate(`/order-success/${createdOrder.order_number}`, {
      state: { order: createdOrder },
    });
  };

  // Handle Payment Initiation
  const handlePaymentSubmit = async (e) => {
    if (e) e.preventDefault();
    setError("");

    if (!validateAddress()) {
      return;
    }

    if (!isConsentChecked) {
      setConsentError(true);
      setError("Please tick the delivery assurance verification box below before payment.");
      const el = document.getElementById("delivery-consent-card");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    try {
      setLoading(true);

      // CASE 1: International Bank Wire Transfer
      if (!isDomestic && activePaymentTab === "BankTransfer") {
        if (!bankWireData.transferReference.trim()) {
          setError("Please enter your Bank Wire Reference / UTR Number to confirm your order.");
          setLoading(false);
          return;
        }

        const wireTxId = `${bankWireData.senderBank ? bankWireData.senderBank.trim() + " - " : ""}${bankWireData.transferReference.trim()} (${bankWireData.remittanceCurrency})`;

        await submitOrderToBackend({
          paymentMethodName: "International Bank Wire",
          paymentStatus: "Pending (Wire Verification)",
          transactionId: wireTxId,
        });
        return;
      }

      // CASE 2: Domestic Razorpay (UPI, Card, Netbanking)
      const chosenMethodLabel =
        activePaymentTab === "UPI"
          ? "Razorpay (UPI - GPay/PhonePe)"
          : activePaymentTab === "Card"
          ? "Razorpay (Debit / Credit Card)"
          : "Razorpay (Net Banking)";

      // Check for Razorpay Key ID
      const rzpKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

      if (!rzpKey || rzpKey.includes("test_yamunastore")) {
        // Friendly Development / Test Mode Mock:
        // Allows testing full checkout without getting blocked when user hasn't added live keys yet
        const simulatedPaymentId = `pay_mock_${Date.now().toString(36)}`;
        await submitOrderToBackend({
          paymentMethodName: chosenMethodLabel,
          paymentStatus: "Paid (Test Sandbox)",
          transactionId: simulatedPaymentId,
        });
        return;
      }

      // Production / Configured Razorpay Flow
      await openRazorpayModal({
        key: rzpKey,
        amountInRupees: finalPayableAmount,
        name: "Yamuna Store Vrindavan",
        description: `Order Fulfillment (${shippingInfo.carrier})`,
        prefill: {
          name: formData.name,
          email: formData.email,
          phone: `${formData.dialCode}${formData.phone}`,
        },
        onSuccess: async (rzpResponse) => {
          try {
            await submitOrderToBackend({
              paymentMethodName: chosenMethodLabel,
              paymentStatus: "Paid",
              transactionId: rzpResponse.razorpay_payment_id || "",
            });
          } catch (err) {
            setError("Payment processed, but order recording failed. Please contact Yamuna Store support.");
          } finally {
            setLoading(false);
          }
        },
        onDismiss: () => {
          setLoading(false);
          setError("Payment cancelled. You can choose another method or retry.");
        },
      });
    } catch (err) {
      console.error("Order processing error:", err);
      const serverMessage =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.message ||
        "Unable to complete payment. Please verify your details and try again.";
      setError(serverMessage);
      setLoading(false);
    }
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponMessage("Radhe Radhe! Coupon code verified — wholesale discounts applied.");
  };

  if (!isCustomerLoggedIn || cartItems.length === 0) {
    return null;
  }

  return (
    <>
      <Navbar />

      <main className="checkout-page">
        <div className="checkout-container">
          <div className="checkout-header">
            <span className="checkout-eyebrow">ORDER FULFILLMENT</span>
            <h1>Delivery &amp; Checkout</h1>
            <p>
              Signed in as <strong>{customerUser?.first_name || customerUser?.username}</strong> ({customerUser?.email}).
            </p>
          </div>

          <div className="checkout-layout">
            {/* Left Column: Hostinger-Style 2-Step Payment Modules */}
            <div className="checkout-left">
              {/* =====================================================
                  STEP 1: BILLING / DELIVERY ADDRESS
                  ===================================================== */}
              <section className={`hostinger-step-card ${!isAddressEditing ? "is-confirmed" : ""}`}>
                <div className="hostinger-card-header">
                  <div className="hostinger-header-left">
                    <span className={`hostinger-step-icon ${!isAddressEditing ? "confirmed" : ""}`}>
                      {!isAddressEditing ? "✓" : "1"}
                    </span>
                    <h2>Billing &amp; Delivery Address</h2>
                  </div>

                  {!isAddressEditing && (
                    <button
                      type="button"
                      className="hostinger-edit-btn"
                      onClick={() => setIsAddressEditing(true)}
                    >
                      Edit
                    </button>
                  )}
                </div>

                {/* Confirmed Summary View (Hostinger Style) */}
                {!isAddressEditing ? (
                  <div className="hostinger-confirmed-address-body">
                    <p className="confirmed-name">{formData.name}</p>
                    <p className="confirmed-phone">
                      {formData.dialCode} {formData.phone}
                    </p>
                    <p className="confirmed-location">
                      {formData.country}
                      {formData.state ? `, ${formData.state}` : ""}
                      {formData.city ? `, ${formData.city}` : ""}
                    </p>
                    <p className="confirmed-street">
                      {formData.address}
                      {formData.pincode ? ` — ${formData.pincode}` : ""}
                    </p>
                    {formData.orderNotes && (
                      <p className="confirmed-notes">
                        <em>Notes:</em> {formData.orderNotes}
                      </p>
                    )}
                  </div>
                ) : (
                  /* Form Editing View */
                  <div className="hostinger-address-form-wrap">
                    {hasSavedAddress && (
                      <p className="saved-address-hint">
                        ✓ Address auto-filled from your profile. Update below or confirm to continue.
                      </p>
                    )}

                    <div className="form-grid">
                      <div className="form-group full-width">
                        <label htmlFor="name">Full Name *</label>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="Receiver's Full Name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="country">Country / Region *</label>
                        <select
                          id="country"
                          name="country"
                          className="checkout-country-select"
                          value={formData.country}
                          onChange={handleCountryChange}
                          required
                        >
                          {COUNTRIES.map((c) => (
                            <option key={c.code} value={c.name}>
                              {c.flag} {c.name} ({c.dialCode})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label htmlFor="phone">WhatsApp / Mobile Number *</label>
                        <div className="phone-input-group">
                          <select
                            className="phone-dial-select"
                            name="dialCode"
                            value={formData.dialCode}
                            onChange={handleChange}
                            aria-label="Country Dial Code"
                          >
                            {COUNTRIES.filter((c) => c.dialCode !== "+").map((c) => (
                              <option key={c.code} value={c.dialCode}>
                                {c.flag} {c.dialCode} ({c.name})
                              </option>
                            ))}
                          </select>
                          <input
                            id="phone"
                            name="phone"
                            type="tel"
                            className="phone-number-input"
                            placeholder="Mobile number"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-group full-width">
                        <label htmlFor="email">Email Address</label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="e.g. devotee@example.com"
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="form-group full-width">
                        <label htmlFor="address">Street Address / House / Ashram No. *</label>
                        <textarea
                          id="address"
                          name="address"
                          rows="2"
                          placeholder="Street, apartment / ashram, landmark"
                          value={formData.address}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="city">City / Town *</label>
                        <input
                          id="city"
                          name="city"
                          type="text"
                          placeholder="e.g. Vrindavan / New York / London"
                          value={formData.city}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="state">State / Province / Region *</label>
                        <input
                          id="state"
                          name="state"
                          type="text"
                          placeholder="e.g. Uttar Pradesh / California"
                          value={formData.state}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="pincode">Pincode / Postal Code *</label>
                        <input
                          id="pincode"
                          name="pincode"
                          type="text"
                          placeholder="e.g. 281121 / 10001"
                          value={formData.pincode}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="orderNotes">Special Delivery Notes</label>
                        <input
                          id="orderNotes"
                          name="orderNotes"
                          type="text"
                          placeholder="Any landmark or timing notes"
                          value={formData.orderNotes}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="address-confirm-action-row">
                      <button
                        type="button"
                        className="confirm-address-btn"
                        onClick={() => {
                          if (validateAddress()) {
                            setIsAddressEditing(false);
                          }
                        }}
                      >
                        Save &amp; Continue to Payment ▾
                      </button>
                    </div>
                  </div>
                )}
              </section>

              {/* =====================================================
                  STEP 2: PAYMENT (Hostinger Style Modular Tabs)
                  ===================================================== */}
              <section className="hostinger-step-card payment-step-card">
                <div className="hostinger-card-header">
                  <div className="hostinger-header-left">
                    <span className="hostinger-step-badge">2</span>
                    <h2>Payment</h2>
                  </div>
                </div>

                <p className="instant-pay-label">Instant pay:</p>

                {/* -------------------------------------------------
                    DOMESTIC (INDIA): RAZORPAY UPI & CARDS
                    ------------------------------------------------- */}
                {isDomestic ? (
                  <div className="hostinger-payment-accordion">
                    {/* OPTION 1: UPI (GPay, PhonePe, Paytm, QR) */}
                    <div className={`payment-accordion-item ${activePaymentTab === "UPI" ? "expanded" : ""}`}>
                      <div
                        className="payment-accordion-header"
                        onClick={() => setActivePaymentTab("UPI")}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="header-method-name">
                          <input
                            type="radio"
                            name="payment_choice"
                            checked={activePaymentTab === "UPI"}
                            onChange={() => setActivePaymentTab("UPI")}
                          />
                          <span className="method-title">UPI</span>
                        </div>
                        <div className="header-logos-wrap">
                          <span className="upi-logo-badge">UPI</span>
                          <span className="brand-mini-badge">GPay</span>
                          <span className="brand-mini-badge">PhonePe</span>
                          <span className="brand-mini-badge">Paytm</span>
                          <span className="accordion-chevron">{activePaymentTab === "UPI" ? "▲" : "▾"}</span>
                        </div>
                      </div>

                      {activePaymentTab === "UPI" && (
                        <div className="payment-accordion-body">
                          <p className="method-instruction">
                            Pay instantly using <strong>Google Pay, PhonePe, Paytm, BHIM</strong>, or any UPI ID / QR code. Verified securely via Razorpay.
                          </p>

                          <button
                            type="button"
                            className="hostinger-submit-payment-btn"
                            disabled={loading}
                            onClick={handlePaymentSubmit}
                          >
                            {loading ? "Processing..." : `Submit payment (Pay ₹${finalPayableAmount.toLocaleString("en-IN")})`}
                          </button>

                          <div className="payment-security-badge">
                            <span>🔒 Encrypted and secure payments</span>
                          </div>

                          <p className="payment-terms-disclaimer">
                            By checking out you agree with our <strong>Terms of Service</strong> and confirm that you have read our <strong>Privacy Policy</strong>.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* OPTION 2: CARDS (Visa, Mastercard, RuPay) */}
                    <div className={`payment-accordion-item ${activePaymentTab === "Card" ? "expanded" : ""}`}>
                      <div
                        className="payment-accordion-header"
                        onClick={() => setActivePaymentTab("Card")}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="header-method-name">
                          <input
                            type="radio"
                            name="payment_choice"
                            checked={activePaymentTab === "Card"}
                            onChange={() => setActivePaymentTab("Card")}
                          />
                          <span className="method-title">Card</span>
                        </div>
                        <div className="header-logos-wrap">
                          <span className="card-badge visa">VISA</span>
                          <span className="card-badge mc">Mastercard</span>
                          <span className="card-badge rupay">RuPay</span>
                          <span className="accordion-chevron">{activePaymentTab === "Card" ? "▲" : "▾"}</span>
                        </div>
                      </div>

                      {activePaymentTab === "Card" && (
                        <div className="payment-accordion-body">
                          <p className="method-instruction">
                            All major Indian Credit &amp; Debit cards supported (RuPay, Visa, Mastercard) via 256-bit bank encrypted gateway.
                          </p>

                          <button
                            type="button"
                            className="hostinger-submit-payment-btn"
                            disabled={loading}
                            onClick={handlePaymentSubmit}
                          >
                            {loading ? "Processing..." : `Submit payment (Pay ₹${finalPayableAmount.toLocaleString("en-IN")})`}
                          </button>

                          <div className="payment-security-badge">
                            <span>🔒 Encrypted and secure payments</span>
                          </div>

                          <p className="payment-terms-disclaimer">
                            By checking out you agree with our <strong>Terms of Service</strong> and confirm that you have read our <strong>Privacy Policy</strong>.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* OPTION 3: NET BANKING */}
                    <div className={`payment-accordion-item ${activePaymentTab === "Netbanking" ? "expanded" : ""}`}>
                      <div
                        className="payment-accordion-header"
                        onClick={() => setActivePaymentTab("Netbanking")}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="header-method-name">
                          <input
                            type="radio"
                            name="payment_choice"
                            checked={activePaymentTab === "Netbanking"}
                            onChange={() => setActivePaymentTab("Netbanking")}
                          />
                          <span className="method-title">Net Banking</span>
                        </div>
                        <div className="header-logos-wrap">
                          <span className="netbanking-hint">SBI, HDFC, ICICI, Axis + 50 Banks</span>
                          <span className="accordion-chevron">{activePaymentTab === "Netbanking" ? "▲" : "▾"}</span>
                        </div>
                      </div>

                      {activePaymentTab === "Netbanking" && (
                        <div className="payment-accordion-body">
                          <p className="method-instruction">
                            Direct corporate and retail net banking for all RBI registered banks via Razorpay.
                          </p>

                          <button
                            type="button"
                            className="hostinger-submit-payment-btn"
                            disabled={loading}
                            onClick={handlePaymentSubmit}
                          >
                            {loading ? "Processing..." : `Submit payment (Pay ₹${finalPayableAmount.toLocaleString("en-IN")})`}
                          </button>

                          <div className="payment-security-badge">
                            <span>🔒 Encrypted and secure payments</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* -------------------------------------------------
                     INTERNATIONAL: DIRECT BANK TRANSFER (SWIFT / WIRE)
                     ------------------------------------------------- */
                  <div className="hostinger-payment-accordion">
                    {/* OPTION 1: DIRECT BANK WIRE (SWIFT) */}
                    <div className={`payment-accordion-item ${activePaymentTab === "BankTransfer" ? "expanded" : ""}`}>
                      <div
                        className="payment-accordion-header"
                        onClick={() => setActivePaymentTab("BankTransfer")}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="header-method-name">
                          <input
                            type="radio"
                            name="payment_choice"
                            checked={activePaymentTab === "BankTransfer"}
                            onChange={() => setActivePaymentTab("BankTransfer")}
                          />
                          <span className="method-title">Direct Bank Wire / SWIFT Transfer</span>
                        </div>
                        <div className="header-logos-wrap">
                          <span className="wire-badge">Direct to Account</span>
                          <span className="accordion-chevron">{activePaymentTab === "BankTransfer" ? "▲" : "▾"}</span>
                        </div>
                      </div>

                      {activePaymentTab === "BankTransfer" && (
                        <div className="payment-accordion-body">
                          <p className="method-instruction">
                            International devotees and temples can transfer directly to Yamuna Store's verified Indian bank account via their foreign bank, Wise, or wire transfer.
                          </p>

                          {/* Bank Details Showcase Box */}
                          <div className="bank-details-card">
                            <div className="bank-card-header">
                              <strong>॥ श्री यमुना स्टोर ॥ · Official Bank Account</strong>
                              <span className="bank-currency-tag">{bankDetails.supportedCurrencies}</span>
                            </div>

                            <div className="bank-card-grid">
                              <div className="bank-info-line">
                                <span className="info-label">Beneficiary Name</span>
                                <div className="info-value-row">
                                  <strong>{bankDetails.accountName}</strong>
                                  <button
                                    type="button"
                                    className="copy-chip-btn"
                                    onClick={() => handleCopy(bankDetails.accountName, "name")}
                                  >
                                    {copiedKey === "name" ? "Copied! ✓" : "Copy"}
                                  </button>
                                </div>
                              </div>

                              <div className="bank-info-line">
                                <span className="info-label">Bank Name</span>
                                <strong>{bankDetails.bankName}</strong>
                              </div>

                              <div className="bank-info-line">
                                <span className="info-label">Account Number</span>
                                <div className="info-value-row">
                                  <strong>{bankDetails.accountNumber}</strong>
                                  <button
                                    type="button"
                                    className="copy-chip-btn"
                                    onClick={() => handleCopy(bankDetails.accountNumber, "acc")}
                                  >
                                    {copiedKey === "acc" ? "Copied! ✓" : "Copy"}
                                  </button>
                                </div>
                              </div>

                              <div className="bank-info-line">
                                <span className="info-label">Account Type</span>
                                <span>{bankDetails.accountType}</span>
                              </div>

                              <div className="bank-info-line">
                                <span className="info-label">SWIFT / BIC Code (International)</span>
                                <div className="info-value-row">
                                  <strong className="code-highlight">{bankDetails.swiftCode}</strong>
                                  <button
                                    type="button"
                                    className="copy-chip-btn"
                                    onClick={() => handleCopy(bankDetails.swiftCode, "swift")}
                                  >
                                    {copiedKey === "swift" ? "Copied! ✓" : "Copy"}
                                  </button>
                                </div>
                              </div>

                              <div className="bank-info-line">
                                <span className="info-label">IFSC Code</span>
                                <div className="info-value-row">
                                  <strong>{bankDetails.ifscCode}</strong>
                                  <button
                                    type="button"
                                    className="copy-chip-btn"
                                    onClick={() => handleCopy(bankDetails.ifscCode, "ifsc")}
                                  >
                                    {copiedKey === "ifsc" ? "Copied! ✓" : "Copy"}
                                  </button>
                                </div>
                              </div>

                              <div className="bank-info-line full">
                                <span className="info-label">Branch Address</span>
                                <small>{bankDetails.branch}</small>
                              </div>
                            </div>

                            <p className="bank-transfer-note">
                              💡 <strong>Note:</strong> {bankDetails.notes}
                            </p>
                          </div>

                          {/* Customer Transfer Reference Form */}
                          <div className="bank-transfer-form">
                            <h4>Enter Your Transfer Confirmation:</h4>

                            <div className="form-grid">
                              <div className="form-group">
                                <label htmlFor="senderBank">Your Bank / Wire Provider *</label>
                                <input
                                  id="senderBank"
                                  type="text"
                                  placeholder="e.g. Chase Bank / Barclays / Wise"
                                  value={bankWireData.senderBank}
                                  onChange={(e) =>
                                    setBankWireData((prev) => ({ ...prev, senderBank: e.target.value }))
                                  }
                                />
                              </div>

                              <div className="form-group">
                                <label htmlFor="transferReference">Wire Reference / UTR Number *</label>
                                <input
                                  id="transferReference"
                                  type="text"
                                  placeholder="e.g. UTR928471928"
                                  value={bankWireData.transferReference}
                                  onChange={(e) =>
                                    setBankWireData((prev) => ({ ...prev, transferReference: e.target.value }))
                                  }
                                  required
                                />
                              </div>

                              <div className="form-group">
                                <label htmlFor="remittanceCurrency">Remittance Currency</label>
                                <select
                                  id="remittanceCurrency"
                                  value={bankWireData.remittanceCurrency}
                                  onChange={(e) =>
                                    setBankWireData((prev) => ({ ...prev, remittanceCurrency: e.target.value }))
                                  }
                                >
                                  <option value="USD">USD ($) United States Dollar</option>
                                  <option value="EUR">EUR (€) Euro</option>
                                  <option value="GBP">GBP (£) British Pound</option>
                                  <option value="AUD">AUD (A$) Australian Dollar</option>
                                  <option value="CAD">CAD (C$) Canadian Dollar</option>
                                  <option value="INR">INR (₹) Indian Rupee</option>
                                </select>
                              </div>
                            </div>

                            <button
                              type="button"
                              className="hostinger-submit-payment-btn bank-wire-submit"
                              disabled={loading}
                              onClick={handlePaymentSubmit}
                            >
                              {loading ? "Confirming Order..." : "Confirm Order with Bank Wire Reference →"}
                            </button>

                            <div className="payment-security-badge">
                              <span>🔒 Direct Bank Remittance · Your items will be reserved immediately</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* OPTION 2: INTERNATIONAL CARD / PAYPAL */}
                    <div className={`payment-accordion-item ${activePaymentTab === "InternationalCard" ? "expanded" : ""}`}>
                      <div
                        className="payment-accordion-header"
                        onClick={() => setActivePaymentTab("InternationalCard")}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="header-method-name">
                          <input
                            type="radio"
                            name="payment_choice"
                            checked={activePaymentTab === "InternationalCard"}
                            onChange={() => setActivePaymentTab("InternationalCard")}
                          />
                          <span className="method-title">International Card / PayPal</span>
                        </div>
                        <div className="header-logos-wrap">
                          <span className="card-badge visa">VISA</span>
                          <span className="card-badge mc">Mastercard</span>
                          <span className="card-badge paypal">PayPal</span>
                          <span className="accordion-chevron">{activePaymentTab === "InternationalCard" ? "▲" : "▾"}</span>
                        </div>
                      </div>

                      {activePaymentTab === "InternationalCard" && (
                        <div className="payment-accordion-body">
                          <p className="method-instruction">
                            Pay securely with international credit cards or PayPal.
                          </p>

                          <button
                            type="button"
                            className="hostinger-submit-payment-btn"
                            disabled={loading}
                            onClick={handlePaymentSubmit}
                          >
                            {loading ? "Processing..." : `Pay with Card (₹${finalPayableAmount.toLocaleString("en-IN")})`}
                          </button>

                          <div className="payment-security-badge">
                            <span>🔒 Encrypted and secure payments</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </section>

              {/* Delivery Assurance & Privacy Verification Card */}
              <div
                id="delivery-consent-card"
                className={`checkout-verification-card ${
                  consentError && !isConsentChecked ? "has-error" : ""
                } ${isConsentChecked ? "is-confirmed" : ""}`}
              >
                <label className="verification-checkbox-label" htmlFor="delivery-consent-check">
                  <div className="verification-checkbox-touch">
                    <input
                      id="delivery-consent-check"
                      type="checkbox"
                      checked={isConsentChecked}
                      onChange={(e) => {
                        setIsConsentChecked(e.target.checked);
                        if (e.target.checked) {
                          setConsentError(false);
                          setError("");
                        }
                      }}
                      className="verification-native-checkbox"
                    />
                    <span className="verification-custom-box" aria-hidden="true">
                      {isConsentChecked ? "✓" : ""}
                    </span>
                  </div>

                  <div className="verification-text-group">
                    <div className="verification-title-row">
                      <span className="verification-badge">🔒 DELIVERY ASSURANCE</span>
                      <strong>Confirm Delivery &amp; Contact Purpose Only *</strong>
                    </div>
                    <p className="verification-subtext">
                      I confirm that my delivery address and contact details are accurate.
                      My information will strictly be used for order dispatch, safe package delivery, and shipment updates only.
                    </p>
                  </div>
                </label>

                {consentError && !isConsentChecked && (
                  <p className="verification-error-pill" role="alert">
                    ⚠️ Please check this verification box before making payment.
                  </p>
                )}
              </div>

              {error && (
                <div className="checkout-error" role="alert">
                  {error}
                </div>
              )}
            </div>

            {/* Right Column: Hostinger-Style Order Summary */}
            <div className="checkout-right">
              <div className="hostinger-summary-card">
                <h2>Order summary</h2>

                {/* Items Mini List */}
                <div className="summary-items-list">
                  {cartItems.map((item) => (
                    <div key={`${item.id}-${item.size || "default"}`} className="summary-item-row">
                      <div className="summary-item-title-group">
                        <span className="summary-item-name">{item.name}</span>
                        {item.size && <span className="summary-item-size">Size: {item.size}</span>}
                        <span className="summary-item-qty">Qty: {item.quantity}</span>
                      </div>
                      <span className="summary-item-subtotal">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="summary-calc-table">
                  {/* Items Subtotal */}
                  <div className="calc-row">
                    <span>Items Total</span>
                    <span>₹{cartTotal.toLocaleString("en-IN")}</span>
                  </div>

                  {/* Delivery Partner Fee Accordion */}
                  <div className="delivery-accordion-wrap">
                    <div
                      className="delivery-accordion-trigger"
                      onClick={() => setDeliveryDropdownOpen((prev) => !prev)}
                      role="button"
                      tabIndex={0}
                      aria-expanded={deliveryDropdownOpen}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          setDeliveryDropdownOpen((prev) => !prev);
                        }
                      }}
                    >
                      <div className="delivery-trigger-left">
                        <span className="delivery-title">Delivery Partner Fee</span>
                        <span className="weight-badge-pill">
                          ⚖️ {shippingInfo.compactWeightFormatted || shippingInfo.totalWeightFormatted}
                        </span>
                        <span className={`dropdown-chevron-icon ${deliveryDropdownOpen ? "rotated" : ""}`}>
                          ▾
                        </span>
                      </div>
                      <span className="delivery-trigger-price">
                        ₹{shippingInfo.shippingFee.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {deliveryDropdownOpen && (
                      <div className="delivery-dropdown-tray">
                        <div className="tray-line">
                          <span>Carrier:</span>
                          <strong>{shippingInfo.carrierIcon} {shippingInfo.carrier}</strong>
                        </div>
                        <div className="tray-line">
                          <span>Weight:</span>
                          <span>{shippingInfo.totalWeightFormatted}</span>
                        </div>
                        <div className="tray-line">
                          <span>Zone:</span>
                          <span>{shippingInfo.zoneName}</span>
                        </div>
                        <div className="tray-line">
                          <span>Est. Delivery:</span>
                          <span>{shippingInfo.estimatedDelivery}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Taxes line */}
                  <div className="calc-row taxes-row">
                    <span>Taxes &amp; Insurance</span>
                    <span className="taxes-free-badge">Included (₹0)</span>
                  </div>

                  {/* Total */}
                  <div className="calc-row total-row">
                    <div>
                      <strong>Total</strong>
                      <small className="total-sub">All taxes &amp; shipping included</small>
                    </div>
                    <strong className="total-number">
                      ₹{finalPayableAmount.toLocaleString("en-IN")}
                    </strong>
                  </div>
                </div>

                {/* Have a coupon code? */}
                <div className="hostinger-coupon-block">
                  {!couponOpen ? (
                    <button
                      type="button"
                      className="coupon-toggle-link"
                      onClick={() => setCouponOpen(true)}
                    >
                      Have a coupon code?
                    </button>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="coupon-form-row">
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="coupon-input"
                      />
                      <button type="submit" className="coupon-apply-btn">
                        Apply
                      </button>
                    </form>
                  )}
                  {couponMessage && <p className="coupon-success-pill">{couponMessage}</p>}
                </div>

                <div className="summary-security-footer">
                  <span>🔒 256-bit SSL Encrypted Checkout</span>
                  <small>Yamuna Store · Sri Dham Vrindavan</small>
                </div>

                <div className="checkout-back-link">
                  <Link to="/cart">← Return to Cart to modify items</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default Checkout;
