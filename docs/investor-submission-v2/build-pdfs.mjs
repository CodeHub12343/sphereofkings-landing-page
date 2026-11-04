// Render both the Investor Master Blueprint v2.0 and the Shark Ready Buybox
// to print-quality PDFs via the Playwright chromium instance that is
// already a dev dependency of the nextjs app.
//
// Usage (from repo root):
//   node docs/investor-submission-v2/build-pdfs.mjs
//
// If chromium is not yet installed for playwright:
//   cd nextjs && npx playwright install chromium

import { chromium } from "../../nextjs/node_modules/playwright/index.mjs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));

const jobs = [
  {
    html: path.join(here, "01-Investor-Master-Blueprint", "SOK_Updated_Investor_Master_Blueprint.html"),
    pdf:  path.join(here, "01-Investor-Master-Blueprint", "SOK_Updated_Investor_Master_Blueprint.pdf"),
    label: "Blueprint v2.0",
    landscape: false,
  },
  // Legacy portrait buybox kept for reference
  {
    html: path.join(here, "02-Shark-Ready-Buybox", "SOK_Shark_Ready_Buybox.html"),
    pdf:  path.join(here, "02-Shark-Ready-Buybox", "SOK_Shark_Ready_Buybox.pdf"),
    label: "Shark Ready Buybox (portrait, legacy)",
    landscape: false,
  },
  // One-page landscape per the master design prompt
  {
    html: path.join(here, "02-Shark-Ready-Buybox", "SOK_Shark_Ready_Investor_Buybox_One_Pager.html"),
    pdf:  path.join(here, "02-Shark-Ready-Buybox", "SOK_Shark_Ready_Investor_Buybox_One_Pager.pdf"),
    label: "Shark Ready Buybox One-Pager (landscape)",
    landscape: true,
  },
];

const browser = await chromium.launch();
try {
  for (const job of jobs) {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(pathToFileURL(job.html).href, { waitUntil: "networkidle" });
    await page.emulateMedia({ media: "print" });
    await page.pdf({
      path: job.pdf,
      format: "A4",
      landscape: !!job.landscape,
      printBackground: true,
      margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
      preferCSSPageSize: true,
    });
    await ctx.close();
    console.log(`${job.label} → ${job.pdf}`);
  }
} finally {
  await browser.close();
}
