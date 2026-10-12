/**
 * Shipping Calculator for Yamuna Store
 * Carriers supported:
 * 1. India Post (Domestic across India) - Speed Post / Registered Parcel
 * 2. DHL Express (International across 50+ countries) - Worldwide Air Courier
 */

// Category typical fallback weights (in grams) when product.weight is not provided
export const CATEGORY_DEFAULT_WEIGHTS = {
  "gopi dress": 600,
  "sarees": 500,
  "dhoti kurta": 450,
  "kurties": 350,
  "dupattas": 200,
  "accessories": 150,
  "default": 400,
};

/**
 * Parses weight string into grams.
 * Examples handled:
 * "450 g", "450g", "450 grams", "450 gm", "450" -> 450
 * "0.5 kg", "0.5kg", "1.2 kg", "1.2kg" -> 500, 1200
 */
export function parseWeightInGrams(weightInput, fallbackCategory = "") {
  if (typeof weightInput === "number" && !isNaN(weightInput) && weightInput > 0) {
    return weightInput <= 15 ? Math.round(weightInput * 1000) : Math.round(weightInput);
  }

  if (typeof weightInput === "string" && weightInput.trim()) {
    const raw = weightInput.trim().toLowerCase();

    // Check for "kg" or "kilo"
    if (raw.includes("kg") || raw.includes("kilo")) {
      const match = raw.match(/([\d.]+)/);
      if (match) {
        const val = parseFloat(match[1]);
        if (!isNaN(val) && val > 0) {
          return Math.round(val * 1000);
        }
      }
    }

    // Check for "g", "gm", "gram" or pure number
    const match = raw.match(/([\d.]+)/);
    if (match) {
      const val = parseFloat(match[1]);
      if (!isNaN(val) && val > 0) {
        if (val < 10 && !raw.includes("g")) {
          return Math.round(val * 1000);
        }
        return Math.round(val);
      }
    }
  }

  // Fallback based on category
  const catKey = (fallbackCategory || "").toLowerCase().trim();
  for (const [key, w] of Object.entries(CATEGORY_DEFAULT_WEIGHTS)) {
    if (catKey.includes(key)) {
      return w;
    }
  }

  return CATEGORY_DEFAULT_WEIGHTS.default;
}

/**
 * Formats weight in grams to a human-readable display string
 * e.g. 450 -> "450 g", 1200 -> "1.20 kg (1,200 g)"
 */
export function formatWeight(grams) {
  const g = Math.round(grams || 0);
  if (g < 1000) {
    return `${g} g`;
  }
  const kg = (g / 1000).toFixed(2);
  return `${kg} kg (${g.toLocaleString("en-IN")} g)`;
}

/**
 * Compact weight format for badges (e.g. "450 g" or "1.2 kg")
 */
export function formatWeightCompact(grams) {
  const g = Math.round(grams || 0);
  if (g < 1000) {
    return `${g} g`;
  }
  const kg = (g / 1000).toFixed(1).replace(/\.0$/, "");
  return `${kg} kg`;
}

/**
 * India Post Speed Post / Parcel domestic calculation
 * Origin: Sri Dham Vrindavan / Mathura, Uttar Pradesh (PIN: 281121)
 */
export function calculateIndiaPost(totalGrams, pincode = "") {
  const cleanPin = String(pincode || "").replace(/\D/g, "");
  const pinPrefix2 = cleanPin.slice(0, 2);
  const pinPrefix3 = cleanPin.slice(0, 3);
  const isPincodePending = cleanPin.length < 6;

  // Determine Zone from Pincode
  let zoneName = "Rest of India (Speed Post)";
  let zoneType = "National";
  let baseRate = 70; // first 500g
  let additionalRate = 35; // per addl 500g

  if (cleanPin.length >= 2) {
    // Local UP & Delhi NCR (20-28, 11, 12, 13)
    const upDelhiPins = ["20", "21", "22", "23", "24", "25", "26", "27", "28", "11", "12", "13"];
    // Remote / Special / North-East / Islands (79, 78, 18, 19, 74)
    const remotePins = ["79", "78", "18", "19", "74"];

    if (upDelhiPins.includes(pinPrefix2)) {
      zoneName = "UP & Delhi-NCR Zone (Local Delivery)";
      zoneType = "Local/State";
      baseRate = 50;
      additionalRate = 25;
    } else if (remotePins.includes(pinPrefix2) || pinPrefix3 === "737") {
      zoneName = "North-East / J&K / Islands Zone";
      zoneType = "Special";
      baseRate = 95;
      additionalRate = 45;
    }
  }

  const billableWeight = Math.max(100, Math.round(totalGrams));
  const baseSlabWeight = 500; // grams

  let additionalWeightGrams = 0;
  let additionalSlabs = 0;
  let additionalCharge = 0;

  if (billableWeight > baseSlabWeight) {
    additionalWeightGrams = billableWeight - baseSlabWeight;
    additionalSlabs = Math.ceil(additionalWeightGrams / baseSlabWeight);
    additionalCharge = additionalSlabs * additionalRate;
  }

  const shippingFee = baseRate + additionalCharge;

  const rateExplanation =
    additionalSlabs > 0
      ? `₹${baseRate} (first 500 g) + ${additionalSlabs} × ₹${additionalRate} (${formatWeight(additionalWeightGrams)} addl.)`
      : `₹${baseRate} base slab (up to 500 g)`;

  return {
    carrier: "India Post",
    service: "Speed Post / Tracked Parcel",
    carrierIcon: "🇮🇳",
    destinationType: "Domestic",
    zoneName,
    zoneType,
    baseRate,
    additionalRate,
    baseSlabWeight,
    billableWeight,
    additionalSlabs,
    additionalCharge,
    shippingFee,
    rateExplanation,
    estimatedDelivery: zoneType === "Local/State" ? "2–3 Business Days" : "3–5 Business Days",
    isPincodePending,
    notice: isPincodePending
      ? "Standard national rate shown. Enter full 6-digit pin code for exact tariff."
      : null,
  };
}

/**
 * DHL Express International Courier calculation
 * Origin: India
 */
export function calculateDHL(totalGrams, country = "United States") {
  const normCountry = (country || "United States").toLowerCase().trim();

  // Zone A: South Asia, GCC & Middle East
  const zoneACountries = [
    "united arab emirates", "saudi arabia", "oman", "qatar", "bahrain", "kuwait",
    "nepal", "sri lanka", "bangladesh", "singapore", "malaysia", "thailand",
    "indonesia", "philippines", "vietnam", "bhutan", "maldives",
  ];

  // Zone B: United Kingdom & Europe
  const zoneBCountries = [
    "united kingdom", "germany", "france", "italy", "spain", "netherlands",
    "switzerland", "belgium", "sweden", "norway", "denmark", "ireland",
    "austria", "poland", "portugal", "greece", "czech republic", "finland",
    "hungary", "romania", "russia", "turkey",
  ];

  // Zone C: North America & Oceania
  const zoneCCountries = [
    "united states", "usa", "canada", "australia", "new zealand", "mexico",
  ];

  let zoneName = "DHL Zone 3 · North America & Oceania";
  let baseRate = 2600; // up to 1.0 kg (1000g)
  let additionalRate = 600; // per addl 500g

  if (zoneACountries.some((c) => normCountry.includes(c))) {
    zoneName = "DHL Zone 1 · South Asia & Middle East";
    baseRate = 1800;
    additionalRate = 400;
  } else if (zoneBCountries.some((c) => normCountry.includes(c))) {
    zoneName = "DHL Zone 2 · UK & Europe";
    baseRate = 2300;
    additionalRate = 500;
  } else if (zoneCCountries.some((c) => normCountry.includes(c))) {
    zoneName = "DHL Zone 3 · North America & Oceania";
    baseRate = 2600;
    additionalRate = 600;
  } else {
    zoneName = "DHL Zone 4 · Rest of the World";
    baseRate = 3100;
    additionalRate = 750;
  }

  const billableWeight = Math.max(200, Math.round(totalGrams));
  const baseSlabWeight = 1000; // 1 kg

  let additionalWeightGrams = 0;
  let additionalSlabs = 0;
  let additionalCharge = 0;

  if (billableWeight > baseSlabWeight) {
    additionalWeightGrams = billableWeight - baseSlabWeight;
    additionalSlabs = Math.ceil(additionalWeightGrams / 500);
    additionalCharge = additionalSlabs * additionalRate;
  }

  const shippingFee = baseRate + additionalCharge;

  const rateExplanation =
    additionalSlabs > 0
      ? `₹${baseRate.toLocaleString("en-IN")} (base up to 1 kg) + ${additionalSlabs} × ₹${additionalRate} (${formatWeight(additionalWeightGrams)} addl.)`
      : `₹${baseRate.toLocaleString("en-IN")} base slab (up to 1.0 kg)`;

  return {
    carrier: "DHL Express",
    service: "DHL Express Worldwide Air",
    carrierIcon: "✈️",
    destinationType: "International",
    zoneName,
    baseRate,
    additionalRate,
    baseSlabWeight,
    billableWeight,
    additionalSlabs,
    additionalCharge,
    shippingFee,
    rateExplanation,
    estimatedDelivery: "4–7 Business Days (Worldwide Tracked)",
    isPincodePending: false,
    notice: "Tracked air express courier direct from Sri Vrindavan Dham to your doorstep.",
  };
}

/**
 * Complete shipping calculation for cart items and destination
 */
export function calculateShipping({ items = [], country = "India", pincode = "" }) {
  let totalWeightGrams = 0;
  const itemWeightsBreakdown = (items || []).map((item) => {
    const qty = Math.max(1, Number(item.quantity) || 1);
    const weightPerUnit = parseWeightInGrams(item.weight, item.category || item.name);
    const itemTotalWeight = weightPerUnit * qty;
    totalWeightGrams += itemTotalWeight;

    return {
      id: item.id,
      name: item.name,
      size: item.size || "",
      quantity: qty,
      weightPerUnitGrams: weightPerUnit,
      weightPerUnitFormatted: formatWeight(weightPerUnit),
      totalGrams: itemTotalWeight,
      totalFormatted: formatWeight(itemTotalWeight),
    };
  });

  const totalWeightFormatted = formatWeight(totalWeightGrams);
  const compactWeightFormatted = formatWeightCompact(totalWeightGrams);

  const isIndia = !country || country.toLowerCase().trim() === "india";

  const carrierDetails = isIndia
    ? calculateIndiaPost(totalWeightGrams, pincode)
    : calculateDHL(totalWeightGrams, country);

  return {
    ...carrierDetails,
    totalWeightGrams,
    totalWeightFormatted,
    compactWeightFormatted,
    itemWeightsBreakdown,
  };
}
