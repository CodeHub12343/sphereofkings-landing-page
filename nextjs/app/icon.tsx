// Build-time generated PWA / Android home-screen icon. Next.js serves
// this at /icon-<hash>?... and auto-injects the appropriate <link> tags.
// Multiple sizes come from the `sizes` export — Android picks whichever
// matches the device density.
//
// The brand mark: gold crown over a dark sphere, red-crested shield
// backdrop. Legible from 48px up.

import { ImageResponse } from "next/og";

export const runtime = "edge";
export const contentType = "image/png";
export const size = { width: 512, height: 512 };

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(circle at 50% 42%, #3a1420 0%, #170809 55%, #080303 100%)",
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 512 512"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="sphere" cx="42%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#faf5e6" />
              <stop offset="35%" stopColor="#d4af37" />
              <stop offset="75%" stopColor="#8a6f1a" />
              <stop offset="100%" stopColor="#1a1510" />
            </radialGradient>
            <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fff2b8" />
              <stop offset="50%" stopColor="#f0c040" />
              <stop offset="100%" stopColor="#8a6f1a" />
            </linearGradient>
            <linearGradient id="shieldRed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c91e34" />
              <stop offset="100%" stopColor="#5a0810" />
            </linearGradient>
          </defs>

          {/* Shield backdrop */}
          <path
            d="M 96 128 L 416 128 L 416 300 Q 416 400 256 464 Q 96 400 96 300 Z"
            fill="url(#shieldRed)"
            stroke="url(#gold)"
            strokeWidth="12"
          />

          {/* Sphere */}
          <circle cx="256" cy="300" r="110" fill="url(#sphere)" />
          {/* Sphere seam lines (meridians) suggesting the cylindrical board */}
          <ellipse
            cx="256"
            cy="300"
            rx="40"
            ry="110"
            fill="none"
            stroke="rgba(0,0,0,0.3)"
            strokeWidth="2"
          />
          <ellipse
            cx="256"
            cy="300"
            rx="80"
            ry="110"
            fill="none"
            stroke="rgba(0,0,0,0.22)"
            strokeWidth="2"
          />
          <line
            x1="256"
            y1="190"
            x2="256"
            y2="410"
            stroke="rgba(0,0,0,0.28)"
            strokeWidth="2"
          />

          {/* Crown on top */}
          <g transform="translate(256, 150)">
            {/* Base band */}
            <rect x="-80" y="20" width="160" height="22" rx="4" fill="url(#gold)" stroke="#5a4512" strokeWidth="3" />
            {/* Five points — crown spikes */}
            <path
              d="M -80 20 L -62 -34 L -40 10 L -20 -52 L 0 10 L 20 -52 L 40 10 L 62 -34 L 80 20 Z"
              fill="url(#gold)"
              stroke="#5a4512"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Jewels on the spikes */}
            <circle cx="-62" cy="-30" r="7" fill="#c91e34" stroke="#5a0810" strokeWidth="1.5" />
            <circle cx="-20" cy="-48" r="8" fill="#4ea9ff" stroke="#1a3a5a" strokeWidth="1.5" />
            <circle cx="20" cy="-48" r="8" fill="#4ea9ff" stroke="#1a3a5a" strokeWidth="1.5" />
            <circle cx="62" cy="-30" r="7" fill="#c91e34" stroke="#5a0810" strokeWidth="1.5" />
            {/* Center jewel on band */}
            <rect x="-14" y="24" width="28" height="14" rx="3" fill="#c91e34" stroke="#5a0810" strokeWidth="1.5" />
          </g>
        </svg>
      </div>
    ),
    { ...size },
  );
}
