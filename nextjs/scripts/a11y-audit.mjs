#!/usr/bin/env node
// Lightweight accessibility audit: launches a headless browser,
// pulls axe-core from the CDN, visits a configured list of routes
// and fails on any violation of impact "serious" or "critical".
//
// Usage:
//   SITE_URL=http://localhost:3000 node scripts/a11y-audit.mjs
//
// The puppeteer/playwright dep is optional — this script tells you
// what to install if missing instead of adding it to the main
// package.json. CI runners that need it: `npm i -D playwright`.

const SITE = process.env.SITE_URL ?? "http://localhost:3000";
const ROUTES = [
  "/",
  "/play",
  "/puzzles",
  "/tournaments",
  "/leaderboards",
  "/champions",
  "/blog",
  "/signin",
  "/signup",
];

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error("playwright not installed. Run: npm i -D playwright && npx playwright install chromium");
  process.exit(2);
}

const browser = await chromium.launch();
const context = await browser.newContext();
let violations = 0;
try {
  for (const path of ROUTES) {
    const page = await context.newPage();
    const url = SITE + path;
    try {
      await page.goto(url, { waitUntil: "load", timeout: 20000 });
      await page.addScriptTag({ url: "https://cdn.jsdelivr.net/npm/axe-core@4.10.2/axe.min.js" });
      const result = await page.evaluate(async () => {
        /* global axe */
        // eslint-disable-next-line no-undef
        return await axe.run(document, { resultTypes: ["violations"] });
      });
      const serious = result.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      console.log(`${path}: ${result.violations.length} violations (${serious.length} serious/critical)`);
      for (const v of serious) {
        console.log(`  - [${v.impact}] ${v.id}: ${v.help}`);
        violations++;
      }
    } catch (err) {
      console.error(`FAIL ${path}:`, err.message);
      violations++;
    } finally {
      await page.close();
    }
  }
} finally {
  await browser.close();
}
process.exit(violations > 0 ? 1 : 0);
