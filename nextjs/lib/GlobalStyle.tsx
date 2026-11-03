"use client";

import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  :root {
    --gold: #c9a227;
    --gold-light: #f0c040;
    --text: #f5f0e8;
    --text-muted: #a89880;
    --bg: #0a0a0a;
    --bg2: #0d0b08;
    --bg3: #111009;
    --border: #2a2218;
    --section-pad: clamp(60px, 8vw, 112px);
  }

  *, *::before, *::after { box-sizing: border-box; }

  html, body { overflow-x: hidden; }

  /* Keep in-page anchor jumps (e.g. #story) from landing under the
     now-fixed site header. 70px matches HeaderSpacer on desktop; 64px
     on phones. */
  html { scroll-padding-top: 70px; }
  @media (max-width: 720px) {
    html { scroll-padding-top: 64px; }
  }

  body {
    margin: 0;
    font-family: 'Inter', system-ui, sans-serif;
    background: #0a0a0a;
    color: #f5f0e8;
    -webkit-font-smoothing: antialiased;
  }

  /* Game app (class set by AppChrome): behave like an installed app —
     no rubber-band bounce or pull-to-refresh, no grey tap flash. */
  /* Root element only: body is itself a (non-scrolling) scroll
     container here because of the overflow-x rule above, and
     overscroll-behavior on it would stop wheel/touch scrolls from
     chaining up to the page — the page would not scroll at all. */
  html.sok-app {
    overscroll-behavior: none;
    scroll-padding-top: calc(72px + env(safe-area-inset-top));
  }
  html.sok-app body { -webkit-tap-highlight-color: transparent; }

  a { color: #c9a227; }
  a:hover { color: #f0c040; }

  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes float-orb {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50%       { transform: translateY(-14px) rotate(4deg); }
  }
  @keyframes pulse-dot {
    0%   { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7); }
    70%  { box-shadow: 0 0 0 10px rgba(74, 222, 128, 0); }
    100% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0); }
  }

  @media (max-width: 720px) {
    :root { --section-pad: clamp(48px, 12vw, 72px); }
  }
`;
