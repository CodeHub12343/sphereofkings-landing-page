"use client";

import QRCode from "qrcode";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type PosterData = {
  affiliateName: string;
  code: string;
  referralUrl: string; // without protocol, e.g. "sphereofkings.com/r/POSTER-247"
  heroImageUrl?: string;
};

// Opens an isolated print window containing a US-Letter poster with a
// real QR code (SVG string from `qrcode`). The user picks "Save as PDF"
// from the browser print dialog to produce a PDF — honest and
// dependency-free beyond `qrcode`.
export async function openAffiliatePosterPrintWindow(data: PosterData) {
  const absoluteUrl = `https://${data.referralUrl}`;
  const qrSvg = await QRCode.toString(absoluteUrl, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: "#15110A", light: "#FBF9F4" },
  });

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Sphere of Kings · ${escapeHtml(data.code)}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 24px;
      background: #e8e2d0;
      color: #15110A;
      font-family: 'Helvetica Neue', Arial, sans-serif;
    }
    .toolbar {
      max-width: 780px;
      margin: 0 auto 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .toolbar h1 {
      font-family: 'Georgia', 'Cinzel', serif;
      font-size: 16px;
      margin: 0;
      color: #4A4232;
    }
    .btn {
      background: linear-gradient(135deg, #b8901e 0%, #f0c040 50%, #b8901e 100%);
      color: #0a0a0a;
      border: 0;
      padding: 10px 18px;
      border-radius: 6px;
      font-family: 'Georgia', serif;
      font-weight: 700;
      font-size: 13px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      cursor: pointer;
    }

    .poster {
      max-width: 780px;
      aspect-ratio: 8.5 / 11;
      margin: 0 auto;
      background: #FBF9F4;
      color: #15110A;
      padding: 48px 56px;
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 28px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    .poster::before {
      content: "";
      position: absolute;
      inset: 24px;
      border: 1.5px solid #B8912A;
      pointer-events: none;
    }

    .mast {
      text-align: center;
      font-family: 'Georgia', 'Cinzel', serif;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: #9C7A1E;
      position: relative;
    }
    .mast::before, .mast::after {
      content: "";
      display: inline-block;
      width: 60px;
      height: 1px;
      background: #B8912A;
      vertical-align: middle;
      margin: 0 16px;
    }

    .hero {
      aspect-ratio: 4 / 3;
      background: #1a1620;
      border: 2px solid #9C7A1E;
      display: grid;
      place-items: center;
      overflow: hidden;
    }
    .hero img {
      width: 100%; height: 100%;
      object-fit: cover;
    }

    .hook {
      text-align: center;
      font-family: 'Georgia', 'Cinzel', serif;
      font-size: 54px;
      line-height: 1.05;
      font-weight: 800;
      margin: 0;
      letter-spacing: -0.01em;
    }
    .hook em { font-style: italic; color: #9C7A1E; }

    .sub {
      text-align: center;
      font-size: 14px;
      color: #4A4232;
      margin: 0;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      font-weight: 700;
    }

    .qr-row {
      display: flex;
      align-items: center;
      gap: 24px;
      padding: 18px 20px;
      background: #F2EDE2;
      border: 1px solid #d9cfae;
      border-radius: 4px;
    }
    .qr {
      width: 150px;
      height: 150px;
      flex-shrink: 0;
      background: #FBF9F4;
      padding: 6px;
      border: 1px solid #B8912A;
    }
    .qr svg { display: block; width: 100%; height: 100%; }

    .qr-body { min-width: 0; }
    .qr-k {
      font-family: 'Georgia', 'Cinzel', serif;
      font-size: 11px;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #7A6F57;
      margin: 0 0 8px;
      font-weight: 700;
    }
    .qr-url {
      font-family: 'Menlo', 'Consolas', monospace;
      font-size: 20px;
      font-weight: 700;
      word-break: break-all;
      margin: 0;
    }
    .qr-aff {
      font-size: 13px;
      color: #4A4232;
      margin: 10px 0 0;
      letter-spacing: 0.04em;
    }

    .cta {
      text-align: center;
      font-size: 16px;
      font-weight: 700;
      margin: 0;
    }
    .foot {
      margin-top: auto;
      display: flex;
      justify-content: space-between;
      font-family: 'Menlo', 'Consolas', monospace;
      font-size: 10px;
      color: #7A6F57;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }
    .foot b { color: #9C7A1E; }

    @media print {
      body { padding: 0; background: #fff; }
      .toolbar { display: none; }
      .poster {
        max-width: none;
        margin: 0;
        box-shadow: none;
        aspect-ratio: auto;
      }
      @page {
        size: Letter;
        margin: 0.4in;
      }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <h1>Printable poster · ${escapeHtml(data.code)}</h1>
    <button class="btn" onclick="window.print()">Save as PDF / Print</button>
  </div>
  <main class="poster" role="article" aria-label="Printable affiliate poster for ${escapeHtml(data.code)}">
    <h2 class="mast">Sphere of Kings</h2>
    <div class="hero" aria-hidden="true">
      ${
        data.heroImageUrl
          ? `<img src="${escapeHtml(data.heroImageUrl)}" alt="" />`
          : `<div style="color:#9C7A1E;font-family:Georgia,serif;letter-spacing:0.1em;text-transform:uppercase;font-size:12px;">Hero image placeholder</div>`
      }
    </div>
    <h3 class="hook">Seven games.<br/>One <em>royal</em> sphere.</h3>
    <p class="sub">Christmas Early Bird · Deliveries start Dec 1, 2026</p>
    <div class="qr-row">
      <div class="qr">${qrSvg}</div>
      <div class="qr-body">
        <p class="qr-k">Scan to shop</p>
        <p class="qr-url">${escapeHtml(data.referralUrl)}</p>
        <p class="qr-aff">Affiliate · ${escapeHtml(data.affiliateName)}</p>
      </div>
    </div>
    <p class="cta">Scan or visit the link to shop the Christmas Early Bird.</p>
    <div class="foot">
      <span>Printable at <b>US Letter</b> &middot; 8.5 × 11 in</span>
      <span>${escapeHtml(data.code)}</span>
    </div>
  </main>
  <script>
    document.querySelector(".btn")?.focus();
  </script>
</body>
</html>`;

  const win = window.open("", "_blank", "width=900,height=1100");
  if (!win) {
    const dataUrl = "data:text/html;charset=utf-8," + encodeURIComponent(html);
    window.open(dataUrl, "_blank");
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}
