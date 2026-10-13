import React from "react";

/**
 * Sacred Icons for Sri Vrindavan Wardrobe
 * Replaces informal emoji stickers with elegant, meaningful devotional motifs.
 */

// 1. All Creations: Sacred Lotus (Kamal / Padmam) of Sri Radha Krishna
export function IconLotus({ className = "", size = 22, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M12 3c-1.6 3.5-3 6.8-3 9.6 0 2.4 1.3 4.4 3 4.4s3-2 3-4.4c0-2.8-1.4-6.1-3-9.6z" />
      <path d="M12 17c-2.4 0-5.4-.8-6.8-3.4 0 0 1.2-4.5 4.4-6 .3 2.5 1 5.1 2.4 6.6" />
      <path d="M12 17c2.4 0 5.4-.8 6.8-3.4 0 0-1.2-4.5-4.4-6-.3 2.5-1 5.1-2.4 6.6" />
      <path d="M4 17.5c2.2 2 5.2 2.5 8 2.5s5.8-.5 8-2.5" />
      <path d="M7 21c2 1 3.5 1 5 1s3 0 5-1" />
    </svg>
  );
}

// 2. Women's Attire: Graceful Gopi Dress / Saree Drape & Odhani Motif
export function IconWomensAttire({ className = "", size = 22, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M9 3.5h6l1.2 4.5-2.2 2 4.5 10H5.5l4.5-10-2.2-2L9 3.5z" />
      <path d="M9 3.5v4.5c0 1.4 1.3 2.5 3 2.5s3-1.1 3-2.5V3.5" />
      <path d="M12 10.5v9.5" />
      <path d="M9.5 13.5l-2 6.5" />
      <path d="M14.5 13.5l2 6.5" />
      <path d="M6 7.5c2.5-1.5 5-1 7.5.5s4.5 3 4.5 3" />
    </svg>
  );
}

// 3. Men's Attire: Traditional Vedic Dhoti Kurta & Angavastram Sash
export function IconMensAttire({ className = "", size = 22, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M8 3h8l2.2 6.5-3.2 1.5v10H9v-10L5.8 9.5 8 3z" />
      <path d="M10 3v4.5c0 1.1.9 2 2 2s2-.9 2-2V3" />
      <path d="M12 9.5V21" />
      <path d="M8 3.5c1 3.5 1.5 8 0 13" />
      <path d="M6 21h12" />
    </svg>
  );
}

// 4. Kids' Attire: Sri Krishna Mor Pankh (Sacred Peacock Feather of Bal Gopal)
export function IconKidsAttire({ className = "", size = 22, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M5 21.5C7.5 16.5 12 10.5 17 3.5" />
      <path d="M17 3.5c2.8 1 3.8 4 2.2 6.8-1.6 2.8-5 3.4-7.2 1.8-2.2-1.6-2.5-4.5-.8-6.6 1.4-1.7 3.8-2.5 5.8-2z" />
      <circle cx="15.5" cy="7.5" r="2" />
      <circle cx="15.5" cy="7.5" r="0.8" fill="currentColor" />
      <path d="M13.5 10.5c-2 2-3.8 4.8-4.8 7.5" />
      <path d="M15.5 13.5c-1.5 2.2-2.5 4.5-3 6.5" />
    </svg>
  );
}
