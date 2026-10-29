#!/usr/bin/env node
// Automated walkthrough recorder for Sphere of Kings.
//
// Produces a 1080p ~90-second product-tour video of the live site —
// hero, giveaway, playable games (flat + sphere), shop, admin, footer.
// Nothing is clicked that would modify data; the finance admin page is
// skipped if admin signin fails.
//
// Usage:
//   node scripts/walkthrough.mjs                    # records against localhost:3000
//   SOK_URL=https://sphereofkings.com node scripts/walkthrough.mjs
//
// Output:
//   scripts/walkthrough-output/<timestamp>.webm      (one file per run)
//
// Convert to MP4 (optional, needs ffmpeg installed):
//   ffmpeg -i scripts/walkthrough-output/*.webm -c:v libx264 -crf 23 walkthrough.mp4

import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { mkdirSync, readdirSync, renameSync, statSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const baseUrl = process.env.SOK_URL ?? "http://localhost:3000";
const outDir = resolve(__dirname, "walkthrough-output");
mkdirSync(outDir, { recursive: true });

const SIZE = { width: 1920, height: 1080 };

const scene = async (label, ms, fn) => {
  console.log(`▶ ${label}`);
  try {
    await fn();
  } catch (err) {
    console.log(`   (scene "${label}" failed: ${err?.message?.split("\n")[0]} — continuing)`);
  }
  await new Promise((r) => setTimeout(r, ms));
};

/** Pre-warm the Next.js dev server by GETting every URL once. Cuts
 *  the recorded run's first-navigation-per-page compile time from
 *  60+s down to ~1s each. */
const prewarm = async (urls) => {
  console.log("Pre-warming dev-server routes…");
  for (const u of urls) {
    const t0 = Date.now();
    try {
      const res = await fetch(u, { method: "GET" });
      await res.text();
      console.log(`   ${res.status} ${u}  (${Date.now() - t0}ms)`);
    } catch (e) {
      console.log(`   SKIP ${u}  (${e?.message ?? e})`);
    }
  }
};

const smoothScrollTo = async (page, y, duration = 1200) => {
  await page.evaluate(
    ({ y, duration }) =>
      new Promise((resolve) => {
        const start = window.scrollY;
        const dist = y - start;
        const t0 = performance.now();
        const step = (t) => {
          const p = Math.min(1, (t - t0) / duration);
          // ease-in-out cubic
          const eased =
            p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
          window.scrollTo(0, start + dist * eased);
          if (p < 1) requestAnimationFrame(step);
          else resolve();
        };
        requestAnimationFrame(step);
      }),
    { y, duration },
  );
};

(async () => {
  console.log(`Recording walkthrough of ${baseUrl}`);
  console.log(`Output: ${outDir}`);

  // Pre-warm every page we'll visit so the dev-server compile tax
  // doesn't fall inside Playwright's recording window.
  await prewarm([
    `${baseUrl}/`,
    `${baseUrl}/play`,
    `${baseUrl}/play/royal-checkers`,
    `${baseUrl}/play/imperial-kings`,
    `${baseUrl}/shop`,
    `${baseUrl}/sweepstakes`,
    `${baseUrl}/affiliate`,
  ]);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: SIZE,
    recordVideo: { dir: outDir, size: SIZE },
    reducedMotion: "no-preference",
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  try {
    /* ---------------- 1. Hero landing (6s) ---------------- */
    await scene("Hero", 6000, async () => {
      await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForLoadState("load").catch(() => {});
    });

    /* ---------------- 2. Scroll past giveaway band (4s) ---------------- */
    await scene("Giveaway band", 4000, async () => {
      await smoothScrollTo(page, 900, 1500);
    });

    /* ---------------- 3. Play Games band (6s) ---------------- */
    await scene("Game app promo band", 6000, async () => {
      await smoothScrollTo(page, 1700, 1500);
    });

    /* ---------------- 4. Click into Royal Checkers (6s on page) ---------------- */
    await scene("Royal Checkers lands", 5000, async () => {
      await page.getByRole("link", { name: /Play Royal Checkers|Play now/i })
        .first()
        .click();
      await page.waitForLoadState("load").catch(() => {});
      await smoothScrollTo(page, 300, 800);
    });

    /* ---------------- 5. Toggle to Sphere board — the WOW moment (8s) ---------------- */
    await scene("Sphere board — rotating 3D", 8000, async () => {
      const sphereTab = page.getByRole("tab", { name: /Sphere board/i });
      if (await sphereTab.count()) {
        await sphereTab.click();
        await page.waitForTimeout(1500); // let Three.js hydrate
      }
    });

    /* ---------------- 6. Imperial Kings (6s) ---------------- */
    await scene("Imperial Kings", 6000, async () => {
      await page.goto(`${baseUrl}/play/imperial-kings`, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForLoadState("load").catch(() => {});
      await smoothScrollTo(page, 300, 800);
    });

    /* ---------------- 7. Imperial Kings sphere mode (6s) ---------------- */
    await scene("Imperial Kings on the sphere", 6000, async () => {
      const sphereTab = page.getByRole("tab", { name: /Sphere board/i });
      if (await sphereTab.count()) {
        await sphereTab.click();
        await page.waitForTimeout(1500);
      }
    });

    /* ---------------- 8. Shop (6s) ---------------- */
    await scene("Shop — 18-product Kickstarter lineup", 6000, async () => {
      await page.goto(`${baseUrl}/shop`, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForLoadState("load").catch(() => {});
      await smoothScrollTo(page, 600, 1500);
    });

    /* ---------------- 9. Royal Sphere Giveaway (5s) ---------------- */
    await scene("Royal Sphere Giveaway page", 5000, async () => {
      await page.goto(`${baseUrl}/sweepstakes`, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForLoadState("load").catch(() => {});
      await smoothScrollTo(page, 400, 1200);
    });

    /* ---------------- 10. Affiliate landing (5s) ---------------- */
    await scene("Affiliate program", 5000, async () => {
      await page.goto(`${baseUrl}/affiliate`, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForLoadState("load").catch(() => {});
      await smoothScrollTo(page, 400, 1200);
    });

    /* ---------------- 11. Footer wrap (4s) ---------------- */
    await scene("Footer — all surfaces", 4000, async () => {
      await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForLoadState("load").catch(() => {});
      await page.evaluate(() =>
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }),
      );
    });

    console.log("✓ Walkthrough captured");
  } catch (err) {
    console.error("Walkthrough failed partway:", err?.message ?? err);
    console.error("A partial video has still been written to " + outDir);
  } finally {
    // Closing the context is what finalises the video file to disk.
    await context.close();
    await browser.close();
  }

  // Playwright writes the video with a random name; rename to a
  // timestamp so re-runs don't collide and the newest run is easy to
  // spot.
  const files = readdirSync(outDir)
    .filter((f) => f.endsWith(".webm"))
    .map((f) => {
      const full = resolve(outDir, f);
      return { full, name: f, mtime: statSync(full).mtimeMs };
    })
    .sort((a, b) => b.mtime - a.mtime);
  if (files.length) {
    const stamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .replace("T", "_")
      .slice(0, 19);
    const newName = `walkthrough-${stamp}.webm`;
    const newPath = resolve(outDir, newName);
    renameSync(files[0].full, newPath);
    console.log(`\n→ Video: ${newPath}`);
    console.log(`\nTo convert to MP4 (needs ffmpeg):`);
    console.log(`  ffmpeg -i "${newPath}" -c:v libx264 -crf 23 walkthrough.mp4\n`);
  }
})();
