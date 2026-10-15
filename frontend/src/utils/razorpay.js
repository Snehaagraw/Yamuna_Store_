// ======================================================================
// RAZORPAY CHECKOUT HELPER
// Loads Razorpay SDK dynamically and opens payment popup modal.
// ======================================================================

export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error("Failed to load Razorpay SDK");
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

/**
 * Open Razorpay Standard Checkout Modal
 * @param {Object} options
 * @param {string} options.key - Razorpay Key ID (rzp_test_... or rzp_live_...)
 * @param {number} options.amount - Amount in paise (e.g. ₹100 = 10000 paise)
 * @param {string} options.currency - e.g. "INR"
 * @param {string} options.name - "Yamuna Store"
 * @param {string} options.description - Order description
 * @param {Object} options.prefill - { name, email, contact }
 * @param {Function} options.onSuccess - Callback on payment success (receives response)
 * @param {Function} options.onDismiss - Callback on modal close / cancel
 */
export const openRazorpayModal = async ({
  key,
  orderId,
  amountInRupees,
  amountInPaise,
  currency = "INR",
  name = "Yamuna Store",
  description = "Devotional Attire Fulfillment",
  orderNumber = "",
  prefill = {},
  onSuccess,
  onDismiss,
}) => {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    throw new Error("Unable to initialize payment gateway. Please check your internet connection.");
  }

  // Convert Rupees to Paise for Razorpay
  const finalPaise = amountInPaise || Math.round(Number(amountInRupees) * 100);

  const razorpayOptions = {
    key: key || import.meta.env.VITE_RAZORPAY_KEY_ID || "",
    amount: finalPaise,
    currency: currency,
    name: name,
    description: description,
    image: "/yamunaStoreFront.jpg",
    order_id: orderId || undefined,
    prefill: {
      name: prefill.name || "",
      email: prefill.email || "",
      contact: prefill.phone || "",
    },
    notes: {
      store: "Yamuna Store Vrindavan",
      order_number: orderNumber,
    },
    theme: {
      color: "#5d1e34", // Yamuna Store signature maroon
    },
    modal: {
      ondismiss: () => {
        if (onDismiss) onDismiss();
      },
    },
    handler: (response) => {
      // response: { razorpay_payment_id, razorpay_order_id, razorpay_signature }
      if (onSuccess) {
        onSuccess(response);
      }
    },
  };

  const rzp = new window.Razorpay(razorpayOptions);
  rzp.on("payment.failed", (err) => {
    console.error("Razorpay Payment Failed:", err);
  });
  rzp.open();
};
