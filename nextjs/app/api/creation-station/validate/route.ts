import { NextResponse } from "next/server";
import { currentPlayer } from "@/lib/auth/player-session";
import { validateGrid } from "@/lib/sphere-grid";

export const runtime = "nodejs";

// Phase-1 feasibility stub. Runs the deterministic checks we can do today
// against the painted grid + customization config. Production will replace
// this with CadQuery / Trimesh validation (watertight mesh, wall thickness,
// clearance, magnet seat placement, stacking height) in the Python service.

interface Config {
  palette?: string[];
  finish?: string;
  category?: string;
  checker?: {
    topColor?: string; bottomColor?: string;
    crown?: boolean; crownColor?: string;
    symbol?: string; engraving?: string;
  };
  personal?: { name?: string; date?: string; message?: string; verse?: string };
}

const MAX_MANUFACTURING_COLORS = 9;

export async function POST(req: Request) {
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });

  let body: { grid?: unknown; config?: Config };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }

  let grid: string[][];
  try { grid = validateGrid(body.grid); }
  catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "bad grid" },
      { status: 400 },
    );
  }

  const config = body.config ?? {};
  const notes: string[] = [];
  let score = 100;
  let level: "ok" | "review" | "blocked" = "ok";

  // 1) Grid coverage
  const painted = grid.flat().filter((c) => c).length;
  const total = grid.length * (grid[0]?.length ?? 0);
  const coverage = total ? painted / total : 0;
  if (coverage < 0.4) {
    notes.push(`Only ${Math.round(coverage * 100)}% of the exterior is painted — large blank zones will print as the base filament.`);
    score -= 10;
  }

  // 2) Distinct manufacturing colors on the grid
  const gridColors = new Set(grid.flat().filter((c) => c));
  if (gridColors.size > MAX_MANUFACTURING_COLORS) {
    notes.push(`Design uses ${gridColors.size} distinct colors on the exterior — above the ${MAX_MANUFACTURING_COLORS}-color manufacturing limit. Expect color consolidation or manual quotation.`);
    score -= 15;
    level = "review";
  }

  // 3) Palette hygiene
  const palette = config.palette ?? [];
  const dupes = palette.length - new Set(palette.map((c) => c.toUpperCase())).size;
  if (dupes > 0) {
    notes.push(`Palette has ${dupes} duplicate HEX values — merge slots to free color budget.`);
    score -= 5;
  }

  // 4) Checker contrast
  if (config.checker?.topColor && config.checker?.bottomColor) {
    if (config.checker.topColor.toUpperCase() === config.checker.bottomColor.toUpperCase()) {
      notes.push("Double-stack checker top and bottom pieces share a color — reduces visual legibility during play.");
      score -= 10;
    }
  }

  // 5) Finish-specific advisories
  if (config.finish === "glow") {
    notes.push("Glow-in-the-dark material requires a dark surrounding color for charge retention.");
  }
  if (config.finish === "translucent") {
    notes.push("Translucent material blends adjacent colors — fine details may lose contrast.");
    score -= 5;
  }

  // 6) Personalization length
  const engrave = (config.checker?.engraving ?? "") + (config.personal?.verse ?? "");
  if (engrave.length > 200) {
    notes.push("Combined engraving text exceeds recommended 200-character surface budget.");
    score -= 5;
  }

  // 7) IP triggers on free-text personalization
  const ipFlags = /\b(disney|marvel|nike|apple|nfl|nba|mlb|olymp)/i;
  const freeText = [
    config.personal?.name, config.personal?.message, config.personal?.verse,
    config.checker?.symbol, config.checker?.engraving,
  ].filter(Boolean).join(" ");
  if (ipFlags.test(freeText)) {
    notes.push("Protected brand or league name detected in personalization — design will route to IP review before production.");
    score -= 20;
    level = "review";
  }

  if (score < 50) level = "blocked";
  else if (score < 80 && level === "ok") level = "review";

  if (notes.length === 0) {
    notes.push("All automated checks passed. Design is within template tolerances for template-based STL generation.");
  }

  return NextResponse.json({
    feasibility: { score: Math.max(0, Math.min(100, score)), level, notes },
    meta: {
      stub: true,
      upgradePath: "Replace with CadQuery/Trimesh geometry validation service.",
    },
  });
}
