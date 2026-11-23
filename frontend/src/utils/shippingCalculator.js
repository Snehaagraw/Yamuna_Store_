/**
 * Shipping Calculator for Yamuna Store
 * Carriers supported:
 * 1. India Post (Domestic across India) - Speed Post / Registered Parcel
 * 2. Shree Maruti Courier (Domestic express courier across India)
 * 3. DHL Express (International across 50+ countries) - Worldwide Air Courier
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
 * Official India Post Speed Post (Retail) Tariff Schedule
 * Origin: Sri Vrindavan Dham, Mathura, UP (PIN: 281121)
 * Tariffs per official India Post Speed Post Parcel Tariff + 18% Postal GST
 */
export const INDIA_POST_SPEED_POST_TARIFFS = {
  local: {
    key: "local",
    name: "Local (Mathura / Vrindavan District)",
    zoneType: "Local",
    slabs: [
      { maxGrams: 500, base: 28 },
      { maxGrams: 1000, base: 48 },
      { maxGrams: 1500, base: 60 },
      { maxGrams: 2000, base: 87 },
      { maxGrams: 3000, base: 116 },
      { maxGrams: 4000, base: 145 },
      { maxGrams: 5000, base: 174 },
    ],
    addlPerKg: 35,
    estimatedDays: "1–2 Business Days",
  },
  state: {
    key: "state",
    name: "Within State (Uttar Pradesh)",
    zoneType: "State",
    slabs: [
      { maxGrams: 500, base: 76 },
      { maxGrams: 1000, base: 101 },
      { maxGrams: 1500, base: 130 },
      { maxGrams: 2000, base: 178 },
      { maxGrams: 3000, base: 243 },
      { maxGrams: 4000, base: 295 },
      { maxGrams: 5000, base: 350 },
    ],
    addlPerKg: 60,
    estimatedDays: "2–3 Business Days",
  },
  metro: {
    key: "metro",
    name: "Zone / Metro Cities (Delhi-NCR, Metros)",
    zoneType: "Metro",
    slabs: [
      { maxGrams: 500, base: 82 },
      { maxGrams: 1000, base: 137 },
      { maxGrams: 1500, base: 182 },
      { maxGrams: 2000, base: 254 },
      { maxGrams: 3000, base: 355 },
      { maxGrams: 4000, base: 430 },
      { maxGrams: 5000, base: 510 },
    ],
    addlPerKg: 95,
    estimatedDays: "2–4 Business Days",
  },
  national: {
    key: "national",
    name: "Rest of India (Speed Post)",
    zoneType: "National",
    slabs: [
      { maxGrams: 500, base: 90 },
      { maxGrams: 1000, base: 143 },
      { maxGrams: 1500, base: 228 },
      { maxGrams: 2000, base: 319 },
      { maxGrams: 3000, base: 450 },
      { maxGrams: 4000, base: 540 },
      { maxGrams: 5000, base: 630 },
    ],
    addlPerKg: 120,
    estimatedDays: "3–6 Business Days",
  },
};

/**
 * India Post Speed Post / Parcel domestic calculation
 * Origin: Sri Dham Vrindavan / Mathura, Uttar Pradesh (PIN: 281121)
 */
export function calculateIndiaPost(totalGrams, pincode = "") {
  const cleanPin = String(pincode || "").replace(/\D/g, "");
  const pinPrefix2 = cleanPin.slice(0, 2);
  const pinPrefix3 = cleanPin.slice(0, 3);
  const isPincodePending = cleanPin.length !== 6;

  // Determine Zone from 6-digit Pincode relative to Vrindavan (PIN: 281121)
  let zoneKey = "national";

  if (cleanPin.length === 6) {
    if (pinPrefix3 === "281") {
      // Local Mathura & Vrindavan district
      zoneKey = "local";
    } else {
      const upPins = ["20", "21", "22", "23", "24", "25", "26", "27", "28"];
      const metroPrefixes = ["11", "12", "13", "201", "400", "401", "402", "403", "404", "700", "600", "560", "500"];

      if (metroPrefixes.some((p) => cleanPin.startsWith(p))) {
        zoneKey = "metro";
      } else if (upPins.includes(pinPrefix2)) {
        zoneKey = "state";
      } else {
        zoneKey = "national";
      }
    }
  }

  const zoneConfig = INDIA_POST_SPEED_POST_TARIFFS[zoneKey];
  const billableWeight = Math.max(100, Math.round(totalGrams));

  // Determine base postal tariff from weight slabs
  let baseTariff = 0;
  let slabDescription = "";

  if (billableWeight <= 5000) {
    const matchedSlab = zoneConfig.slabs.find((s) => billableWeight <= s.maxGrams) || zoneConfig.slabs[zoneConfig.slabs.length - 1];
    baseTariff = matchedSlab.base;
    slabDescription = `Up to ${matchedSlab.maxGrams >= 1000 ? `${matchedSlab.maxGrams / 1000} kg` : `${matchedSlab.maxGrams} g`}`;
  } else {
    const maxSlab = zoneConfig.slabs[zoneConfig.slabs.length - 1];
    const extraKg = Math.ceil((billableWeight - 5000) / 1000);
    baseTariff = maxSlab.base + extraKg * zoneConfig.addlPerKg;
    slabDescription = `5 kg base + ${extraKg} kg addl.`;
  }

  // 18% Postal GST applied on base postage tariff
  const postalGstAmount = Math.round(baseTariff * 0.18);
  const totalPostageWithGst = baseTariff + postalGstAmount;

  const shippingFee = isPincodePending ? 0 : totalPostageWithGst;
  const estimatedFee = totalPostageWithGst;

  const rateExplanation = isPincodePending
    ? "Official India Post Speed Post retail tariff + 18% postal GST calculated on PIN code."
    : `Postage: ₹${baseTariff} (${slabDescription}) + 18% Postal GST: ₹${postalGstAmount} = ₹${totalPostageWithGst} (${zoneConfig.name})`;

  return {
    carrier: "India Post",
    service: "Speed Post Parcel (Retail)",
    carrierIcon: "🇮🇳",
    destinationType: "Domestic",
    zoneName: isPincodePending ? "Delivery PIN Code Pending" : zoneConfig.name,
    zoneType: zoneConfig.zoneType,
    baseTariff,
    postalGstAmount,
    totalPostageWithGst,
    billableWeight,
    shippingFee,
    estimatedFee,
    rateExplanation,
    estimatedDelivery: zoneConfig.estimatedDays,
    isPincodePending,
    notice: isPincodePending
      ? "Enter 6-digit delivery PIN code in Step 1 to calculate exact postal tariff."
      : `Speed Post to PIN ${cleanPin} (${zoneConfig.name}) · Includes 18% Postal GST`,
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
    estimatedFee: shippingFee,
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
