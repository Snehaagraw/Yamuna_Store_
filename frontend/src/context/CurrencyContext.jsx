import { createContext, useContext, useEffect, useState, useMemo } from "react";

export const SUPPORTED_CURRENCIES = [
  { code: "INR", name: "India", symbol: "₹", flag: "🇮🇳", fallbackRate: 1.0 },
  { code: "USD", name: "United States", symbol: "$", flag: "🇺🇸", fallbackRate: 0.0119 },
  { code: "GBP", name: "United Kingdom", symbol: "£", flag: "🇬🇧", fallbackRate: 0.0092 },
  { code: "EUR", name: "European Union", symbol: "€", flag: "🇪🇺", fallbackRate: 0.0109 },
  { code: "CAD", name: "Canada", symbol: "CA$", flag: "🇨🇦", fallbackRate: 0.0163 },
  { code: "AUD", name: "Australia", symbol: "AU$", flag: "🇦🇺", fallbackRate: 0.0182 },
  { code: "AED", name: "United Arab Emirates", symbol: "AED ", flag: "🇦🇪", fallbackRate: 0.0437 },
  { code: "SGD", name: "Singapore", symbol: "SG$", flag: "🇸🇬", fallbackRate: 0.0155 },
  { code: "MYR", name: "Malaysia", symbol: "RM ", flag: "🇲🇾", fallbackRate: 0.0515 },
  { code: "ZAR", name: "South Africa", symbol: "R ", flag: "🇿🇦", fallbackRate: 0.210 },
  { code: "NZD", name: "New Zealand", symbol: "NZ$", flag: "🇳🇿", fallbackRate: 0.0198 },
  { code: "RUB", name: "Russia", symbol: "₽", flag: "🇷🇺", fallbackRate: 1.15 },
  { code: "MUR", name: "Mauritius", symbol: "Rs ", flag: "🇲🇺", fallbackRate: 0.55 },
  { code: "BHD", name: "Bahrain", symbol: "BD ", flag: "🇧🇭", fallbackRate: 0.0045 },
  { code: "QAR", name: "Qatar", symbol: "QR ", flag: "🇶🇦", fallbackRate: 0.043 },
  { code: "KWD", name: "Kuwait", symbol: "KD ", flag: "🇰🇼", fallbackRate: 0.0036 },
];

const DEFAULT_RATES = SUPPORTED_CURRENCIES.reduce((acc, curr) => {
  acc[curr.code] = curr.fallbackRate;
  return acc;
}, {});

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState(() => {
    try {
      return localStorage.getItem("yamuna_currency") || "INR";
    } catch {
      return "INR";
    }
  });

  const [rates, setRates] = useState(DEFAULT_RATES);

  // Fetch real-time exchange rates from open exchange rate API
  useEffect(() => {
    let isMounted = true;

    const fetchLiveRates = async () => {
      try {
        const response = await fetch("https://open.er-api.com/v6/latest/INR");
        if (!response.ok) return;

        const data = await response.json();
        if (data && data.result === "success" && data.rates && isMounted) {
          setRates((prev) => ({
            ...prev,
            ...data.rates,
            INR: 1.0,
          }));
        }
      } catch (err) {
        console.warn("Using offline fallback exchange rates:", err);
      }
    };

    fetchLiveRates();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedCurrency = useMemo(() => {
    return (
      SUPPORTED_CURRENCIES.find((c) => c.code === selectedCurrencyCode) ||
      SUPPORTED_CURRENCIES[0]
    );
  }, [selectedCurrencyCode]);

  const setCurrency = (code) => {
    const matched = SUPPORTED_CURRENCIES.find((c) => c.code === code);
    if (matched) {
      setSelectedCurrencyCode(matched.code);
      try {
        localStorage.setItem("yamuna_currency", matched.code);
      } catch (e) {
        console.warn("Failed to save currency to localStorage:", e);
      }
    }
  };

  const formatPrice = (inrAmount) => {
    const numericInr = Number(inrAmount) || 0;

    if (selectedCurrency.code === "INR") {
      return {
        formatted: `₹${numericInr.toLocaleString("en-IN")}`,
        raw: numericInr,
        isConverted: false,
        symbol: "₹",
        code: "INR",
        originalInr: `₹${numericInr.toLocaleString("en-IN")}`,
        rate: 1.0,
      };
    }

    const rate = rates[selectedCurrency.code] || selectedCurrency.fallbackRate;
    const convertedAmount = numericInr * rate;

    // Use 2 decimal places for foreign currencies
    const formattedConverted = `${selectedCurrency.symbol}${convertedAmount.toLocaleString(
      undefined,
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;

    return {
      formatted: formattedConverted,
      raw: convertedAmount,
      isConverted: true,
      symbol: selectedCurrency.symbol,
      code: selectedCurrency.code,
      originalInr: `₹${numericInr.toLocaleString("en-IN")}`,
      rate,
    };
  };

  const value = {
    selectedCurrency,
    currencies: SUPPORTED_CURRENCIES,
    rates,
    setCurrency,
    formatPrice,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}

export default CurrencyContext;
