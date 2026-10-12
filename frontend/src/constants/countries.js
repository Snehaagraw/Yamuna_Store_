export const COUNTRIES = [
  { code: "IN", name: "India", dialCode: "+91", flag: "🇮🇳" },
  { code: "US", name: "United States", dialCode: "+1", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", dialCode: "+44", flag: "🇬🇧" },
  { code: "CA", name: "Canada", dialCode: "+1", flag: "🇨🇦" },
  { code: "AU", name: "Australia", dialCode: "+61", flag: "🇦🇺" },
  { code: "RU", name: "Russia", dialCode: "+7", flag: "🇷🇺" },
  { code: "AE", name: "United Arab Emirates", dialCode: "+971", flag: "🇦🇪" },
  { code: "NP", name: "Nepal", dialCode: "+977", flag: "🇳🇵" },
  { code: "MU", name: "Mauritius", dialCode: "+230", flag: "🇲🇺" },
  { code: "SG", name: "Singapore", dialCode: "+65", flag: "🇸🇬" },
  { code: "MY", name: "Malaysia", dialCode: "+60", flag: "🇲🇾" },
  { code: "NZ", name: "New Zealand", dialCode: "+64", flag: "🇳🇿" },
  { code: "DE", name: "Germany", dialCode: "+49", flag: "🇩🇪" },
  { code: "FR", name: "France", dialCode: "+33", flag: "🇫🇷" },
  { code: "NL", name: "Netherlands", dialCode: "+31", flag: "🇳🇱" },
  { code: "BD", name: "Bangladesh", dialCode: "+880", flag: "🇧🇩" },
  { code: "LK", name: "Sri Lanka", dialCode: "+94", flag: "🇱🇰" },
  { code: "ZA", name: "South Africa", dialCode: "+27", flag: "🇿🇦" },
  { code: "FJ", name: "Fiji", dialCode: "+679", flag: "🇫🇯" },
  { code: "TT", name: "Trinidad & Tobago", dialCode: "+1868", flag: "🇹🇹" },
  { code: "GY", name: "Guyana", dialCode: "+592", flag: "🇬🇾" },
  { code: "IT", name: "Italy", dialCode: "+39", flag: "🇮🇹" },
  { code: "ES", name: "Spain", dialCode: "+34", flag: "🇪🇸" },
  { code: "CH", name: "Switzerland", dialCode: "+41", flag: "🇨🇭" },
  { code: "BR", name: "Brazil", dialCode: "+55", flag: "🇧🇷" },
  { code: "ID", name: "Indonesia", dialCode: "+62", flag: "🇮🇩" },
  { code: "KE", name: "Kenya", dialCode: "+254", flag: "🇰🇪" },
  { code: "JP", name: "Japan", dialCode: "+81", flag: "🇯🇵" },
  { code: "KR", name: "South Korea", dialCode: "+82", flag: "🇰🇷" },
  { code: "TH", name: "Thailand", dialCode: "+66", flag: "🇹🇭" },
  { code: "SA", name: "Saudi Arabia", dialCode: "+966", flag: "🇸🇦" },
  { code: "QA", name: "Qatar", dialCode: "+974", flag: "🇶🇦" },
  { code: "KW", name: "Kuwait", dialCode: "+965", flag: "🇰🇼" },
  { code: "OM", name: "Oman", dialCode: "+968", flag: "🇴🇲" },
  { code: "BH", name: "Bahrain", dialCode: "+973", flag: "🇧🇭" },
  { code: "IE", name: "Ireland", dialCode: "+353", flag: "🇮🇪" },
  { code: "SE", name: "Sweden", dialCode: "+46", flag: "🇸🇪" },
  { code: "NO", name: "Norway", dialCode: "+47", flag: "🇳🇴" },
  { code: "DK", name: "Denmark", dialCode: "+45", flag: "🇩🇰" },
  { code: "PL", name: "Poland", dialCode: "+48", flag: "🇵🇱" },
  { code: "AT", name: "Austria", dialCode: "+43", flag: "🇦🇹" },
  { code: "BE", name: "Belgium", dialCode: "+32", flag: "🇧🇪" },
  { code: "PT", name: "Portugal", dialCode: "+351", flag: "🇵🇹" },
  { code: "MX", name: "Mexico", dialCode: "+52", flag: "🇲🇽" },
  { code: "AR", name: "Argentina", dialCode: "+54", flag: "🇦🇷" },
  { code: "CL", name: "Chile", dialCode: "+56", flag: "🇨🇱" },
  { code: "CO", name: "Colombia", dialCode: "+57", flag: "🇨🇴" },
  { code: "PH", name: "Philippines", dialCode: "+63", flag: "🇵🇭" },
  { code: "VN", name: "Vietnam", dialCode: "+84", flag: "🇻🇳" },
  { code: "OTHER", name: "Other Country", dialCode: "+", flag: "🌐" },
];

/**
 * Returns country object matching name or code, defaults to India.
 */
export function getCountryByName(name) {
  if (!name) return COUNTRIES[0];
  const found = COUNTRIES.find(
    (c) => c.name.toLowerCase() === name.trim().toLowerCase() || c.code.toLowerCase() === name.trim().toLowerCase()
  );
  return found || COUNTRIES[0];
}

/**
 * Returns country object matching dial code, defaults to India (+91).
 */
export function getCountryByDialCode(dialCode) {
  if (!dialCode) return COUNTRIES[0];
  const cleanCode = dialCode.startsWith("+") ? dialCode : `+${dialCode}`;
  const found = COUNTRIES.find((c) => c.dialCode === cleanCode);
  return found || COUNTRIES[0];
}

/**
 * Splits a full stored phone number (e.g. "+1 202-555-0143" or "+91 9876543210" or "9876543210")
 * into its country dialCode and subscriber number.
 */
export function splitPhoneAndDialCode(rawPhone, countryName = "India") {
  if (!rawPhone) {
    const defaultCountry = getCountryByName(countryName);
    return { dialCode: defaultCountry.dialCode, phone: "" };
  }

  const str = String(rawPhone).trim();

  // If starts with +, try matching against known dialCodes sorted by length descending
  if (str.startsWith("+")) {
    const sorted = [...COUNTRIES]
      .filter((c) => c.dialCode !== "+")
      .sort((a, b) => b.dialCode.length - a.dialCode.length);

    for (const c of sorted) {
      if (str.startsWith(c.dialCode)) {
        const remaining = str.slice(c.dialCode.length).trim().replace(/^[\s-]+/, "");
        return { dialCode: c.dialCode, phone: remaining };
      }
    }

    // Generic + with custom code before space or dash
    const match = str.match(/^(\+\d{1,4})\s*(.*)$/);
    if (match) {
      return { dialCode: match[1], phone: match[2].trim() };
    }
  }

  // If no leading +, look up the provided country's default dial code
  const targetCountry = getCountryByName(countryName);
  return { dialCode: targetCountry.dialCode, phone: str };
}

/**
 * Generates an international WhatsApp link from a stored phone string.
 * Accurately preserves international dial codes and avoids hardcoding +91 for foreign numbers.
 */
export function getWhatsAppUrl(rawPhone, text = "") {
  if (!rawPhone || rawPhone === "N/A") return null;

  const phoneStr = String(rawPhone).trim();
  const digits = phoneStr.replace(/\D/g, "");

  if (!digits) return null;

  let finalNumber = digits;

  // If user entered a 10-digit number without a leading + or country code, default to India (91)
  if (digits.length === 10 && !phoneStr.startsWith("+")) {
    finalNumber = `91${digits}`;
  }

  const base = `https://wa.me/${finalNumber}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/**
 * Returns structured phone information with country details, dial code, flag, subscriber number, and whatsapp url.
 */
export function getPhoneDisplayInfo(rawPhone, countryName = "India", whatsappText = "") {
  if (!rawPhone || rawPhone === "N/A" || String(rawPhone).trim() === "") {
    const country = getCountryByName(countryName);
    return {
      isValid: false,
      rawPhone: "N/A",
      dialCode: country.dialCode,
      countryCode: country.code,
      countryName: country.name,
      flag: country.flag,
      subscriberNumber: "",
      fullFormatted: "N/A",
      isInternational: country.code !== "IN",
      whatsappUrl: null,
    };
  }

  const { dialCode, phone: subscriberNumber } = splitPhoneAndDialCode(rawPhone, countryName);
  const matchedCountry = getCountryByDialCode(dialCode) || getCountryByName(countryName);

  const cleanSubscriber = subscriberNumber.replace(/^[\s-]+/, "");
  const fullFormatted = dialCode ? `${dialCode} ${cleanSubscriber}` : rawPhone;
  const isInternational = matchedCountry.code !== "IN";
  const whatsappUrl = getWhatsAppUrl(rawPhone, whatsappText);

  return {
    isValid: true,
    rawPhone,
    dialCode: matchedCountry.dialCode || dialCode || "+91",
    countryCode: matchedCountry.code || "IN",
    countryName: matchedCountry.name || countryName || "India",
    flag: matchedCountry.flag || "🇮🇳",
    subscriberNumber: cleanSubscriber || rawPhone,
    fullFormatted,
    isInternational,
    whatsappUrl,
  };
}
