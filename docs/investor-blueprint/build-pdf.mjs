// Render the Investor Master Blueprint HTML to a print-quality PDF using the
// Playwright that is already a dev dependency of the nextjs app.
//
// Usage (from repo root):
//   node docs/investor-blueprint/build-pdf.mjs
//
// If chromium is not yet installed for playwright, run first:
//   cd nextjs && npx playwright install chromium

import { chromium } from "../../nextjs/node_modules/playwright/index.mjs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(here, "SOK-Investor-Master-Blueprint-v1.html");
const pdfPath = path.join(here, "SOK-Investor-Master-Blueprint-v1.pdf");

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();

await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "networkidle" });
await page.emulateMedia({ media: "print" });

await page.pdf({
  path: pdfPath,
  format: "A4",
  printBackground: true,
  margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
  preferCSSPageSize: true,
});

await browser.close();
console.log("PDF written to", pdfPath);
