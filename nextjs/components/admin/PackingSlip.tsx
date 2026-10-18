"use client";

import { SampleOrder, formatShipTo } from "@/lib/sample-orders";
import { findCarrier, CarrierId } from "@/lib/carriers";

export type SlipData = {
  order: SampleOrder;
  carrierId: CarrierId;
  trackingNumber: string;
};

// A visual, deterministic bar sequence derived from the tracking string.
// Not a real barcode — real labels come from the carrier's own API — but
// unique per tracking number so operators can match slip to parcel at a
// glance. The slip explicitly calls itself a packing slip, not a shipping
// label, so no one mistakes it for the carrier's bonded label.
function barcodeBars(input: string): string {
  const seed = Math.max(1, input.length);
  const chars = input ? input : "SOK";
  const bars: string[] = [];
  for (let i = 0; i < 60; i++) {
    const c = chars.charCodeAt(i % chars.length) + i;
    const w = (c % 5) + 1; // 1..5 units wide
    const black = (c % 2) === 0;
    bars.push(
      `<span style="display:inline-block;width:${w}px;height:48px;background:${
        black ? "#000" : "transparent"
      }"></span>`,
    );
  }
  return bars.join("");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function openPackingSlipWindow({
  order,
  carrierId,
  trackingNumber,
}: SlipData) {
  const carrier = findCarrier(carrierId);
  const shipTo = order.shipTo
    ? formatShipTo(order.shipTo)
    : "Shipping address unavailable";
  const now = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const originLabel =
    order.origin === "early-bird"
      ? "Christmas Early Bird"
      : order.origin === "kickstarter"
      ? "Kickstarter"
      : "Wholesale";
  const trackSafe = trackingNumber.trim().toUpperCase();

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Packing slip · ${escapeHtml(order.ref)}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 32px;
      background: #f6f1e6;
      color: #15110A;
      font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
    }
    .page {
      max-width: 820px;
      margin: 0 auto;
      background: #fff;
      padding: 32px;
      border: 1px solid #B8912A;
      border-radius: 4px;
      position: relative;
    }
    .page::before, .page::after {
      content: "";
      position: absolute;
      width: 14px; height: 14px;
      border: 1px solid #B8912A;
    }
    .page::before { top: 10px; left: 10px; border-right: 0; border-bottom: 0; }
    .page::after { bottom: 10px; right: 10px; border-left: 0; border-top: 0; }
    .mast {
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 700;
      font-size: 14px;
      text-align: center;
      color: #9C7A1E;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      margin: 0 0 4px;
    }
    .mast-sub {
      text-align: center;
      font-size: 11px;
      color: #4A4232;
      margin: 0 0 24px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .row { display: flex; gap: 24px; justify-content: space-between; }
    .cell {
      border: 1px solid #d9cfae;
      border-radius: 4px;
      padding: 14px 16px;
      flex: 1;
      min-width: 0;
    }
    .cell-k {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #7A6F57;
      margin: 0 0 8px;
    }
    .cell-v {
      font-size: 14px;
      line-height: 1.5;
      color: #15110A;
      white-space: pre-line;
      font-weight: 500;
      margin: 0;
    }
    .ref {
      font-family: 'SF Mono', 'Menlo', 'Consolas', monospace;
      font-size: 20px;
      font-weight: 700;
    }
    .big-block {
      padding: 24px;
      margin: 24px 0;
      border: 2px solid #15110A;
      border-radius: 4px;
    }
    .big-block .cell-k {
      color: #000;
      font-size: 11px;
    }
    .big-ship {
      font-size: 20px;
      line-height: 1.4;
      white-space: pre-line;
      margin: 0;
      font-weight: 700;
    }
    .carrier-row { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
    .carrier-name {
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 700;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    .carrier-track {
      font-family: 'SF Mono', 'Menlo', 'Consolas', monospace;
      font-weight: 700;
      font-size: 14px;
      letter-spacing: 0.04em;
    }
    .barcode {
      margin-top: 10px;
      padding: 8px;
      background: #fff;
      border: 1px solid #000;
      border-radius: 2px;
      overflow: hidden;
      line-height: 0;
    }
    .barcode-caption {
      font-family: 'SF Mono', 'Menlo', 'Consolas', monospace;
      font-size: 12px;
      text-align: center;
      margin-top: 6px;
      letter-spacing: 0.14em;
    }
    .items {
      margin-top: 24px;
      border: 1px solid #d9cfae;
      border-radius: 4px;
      overflow: hidden;
    }
    .items h3 {
      font-family: 'Cinzel', Georgia, serif;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #7A6F57;
      margin: 0;
      padding: 10px 16px;
      border-bottom: 1px solid #d9cfae;
      background: #f6f1e6;
    }
    .items-body { padding: 12px 16px; font-size: 14px; }
    .foot {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #d9cfae;
      font-size: 11px;
      color: #4A4232;
      line-height: 1.6;
      display: flex;
      justify-content: space-between;
      gap: 16px;
    }
    .foot strong { color: #15110A; }
    .toolbar {
      max-width: 820px;
      margin: 0 auto 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .toolbar h1 {
      font-family: 'Cinzel', Georgia, serif;
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
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 700;
      font-size: 13px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      cursor: pointer;
    }
    .origin-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 999px;
      background: rgba(201, 162, 39, 0.14);
      color: #9C7A1E;
      font-family: 'Cinzel', Georgia, serif;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }

    @media print {
      body { padding: 0; background: #fff; }
      .toolbar { display: none; }
      .page {
        border: 0 !important;
        padding: 0.5in;
        max-width: none;
      }
      @page { size: Letter; margin: 0.25in; }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <h1>Packing slip preview</h1>
    <button class="btn" onclick="window.print()">Print</button>
  </div>
  <main class="page" role="article" aria-label="Packing slip for order ${escapeHtml(order.ref)}">
    <h2 class="mast">Sphere of Kings</h2>
    <p class="mast-sub">Packing slip &middot; ${escapeHtml(originLabel)}</p>

    <div class="row">
      <div class="cell">
        <p class="cell-k">Order</p>
        <p class="cell-v ref">${escapeHtml(order.ref)}</p>
        <div style="margin-top:6px;"><span class="origin-badge">${escapeHtml(originLabel)}</span></div>
      </div>
      <div class="cell">
        <p class="cell-k">Printed</p>
        <p class="cell-v">${escapeHtml(now)}</p>
      </div>
      <div class="cell">
        <p class="cell-k">From</p>
        <p class="cell-v">Sphere of Kings<br/>Workshop fulfillment<br/>${escapeHtml(originLabel)}</p>
      </div>
    </div>

    <div class="big-block">
      <p class="cell-k">Ship to</p>
      <p class="big-ship">${escapeHtml(shipTo)}</p>
      <div class="carrier-row">
        <span class="carrier-name">${escapeHtml(carrier.name)}</span>
        <span class="carrier-track">${escapeHtml(trackSafe)}</span>
      </div>
      <div class="barcode" aria-hidden="true">${barcodeBars(trackSafe)}</div>
      <p class="barcode-caption">${escapeHtml(trackSafe)}</p>
    </div>

    <section class="items">
      <h3>Items in this parcel</h3>
      <div class="items-body">${escapeHtml(order.itemSummary)}</div>
    </section>

    <footer class="foot">
      <div>
        <strong>Not a carrier label.</strong> This is an internal packing
        slip. Attach the carrier's generated shipping label alongside this
        slip when the parcel leaves the workshop.
      </div>
      <div style="text-align: right; min-width: 180px;">
        <strong>Early Bird</strong><br/>
        Deliveries start<br/>December 1, 2026
      </div>
    </footer>
  </main>
  <script>
    // Auto-focus the Print button so Space / Enter prints immediately.
    document.querySelector(".btn")?.focus();
  </script>
</body>
</html>`;

  const win = window.open("", "_blank", "width=900,height=1100");
  if (!win) {
    // Pop-up was blocked. Fall back to a data URL in a new tab.
    const dataUrl = "data:text/html;charset=utf-8," + encodeURIComponent(html);
    window.open(dataUrl, "_blank");
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}
