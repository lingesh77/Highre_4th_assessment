import React from "react";

/**
 * Highre Software brand mark — a network/signal motif (three orbiting nodes
 * converging on a core switch), rendered as a gradient SVG so it stays crisp
 * at any size and echoes the app's emerald → cyan → blue theme.
 */
export default function BrandMark({ subtitle = "TECHNOLOGY", size = "md" }) {
  const px = size === "lg" ? 40 : 30;
  return (
    <div className="flex items-center space-x-2.5">
      <svg
        width={px}
        height={px}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 drop-shadow-sm"
      >
        <defs>
          <linearGradient id="hs-logo-grad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="55%" stopColor="#0EA5E9" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
          <linearGradient id="hs-logo-grad-soft" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6EE7B7" />
            <stop offset="100%" stopColor="#7DD3FC" />
          </linearGradient>
        </defs>

        {/* Rounded square base */}
        <rect x="2" y="2" width="44" height="44" rx="13" fill="url(#hs-logo-grad)" />

        {/* Connection lines from core to the three orbiting nodes */}
        <g stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinecap="round">
          <line x1="24" y1="24" x2="24" y2="12" />
          <line x1="24" y1="24" x2="34.4" y2="30" />
          <line x1="24" y1="24" x2="13.6" y2="30" />
        </g>

        {/* Orbiting nodes */}
        <circle cx="24" cy="12" r="4.2" fill="white" />
        <circle cx="34.4" cy="30" r="4.2" fill="white" />
        <circle cx="13.6" cy="30" r="4.2" fill="white" />

        {/* Core switch node */}
        <circle cx="24" cy="24" r="6" fill="url(#hs-logo-grad-soft)" stroke="white" strokeWidth="2" />
      </svg>

      <div className="flex flex-col leading-tight">
        <span className={`font-bold text-gray-800 ${size === "lg" ? "text-lg" : ""}`}>HIGHRE SOFTWARE</span>
        <span className="text-xs text-gray-500 tracking-wide">{subtitle}</span>
      </div>
    </div>
  );
}
