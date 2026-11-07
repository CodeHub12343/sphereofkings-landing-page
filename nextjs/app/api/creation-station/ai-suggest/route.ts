import { NextResponse } from "next/server";
import { currentPlayer } from "@/lib/auth/player-session";
import { DESIGN_COLS, DESIGN_ROWS, emptyGrid } from "@/lib/sphere-grid";

export const runtime = "nodejs";

// Phase-1 stub. Returns a deterministic, theme-matched suggestion so the UI
// is fully usable today. Replace this handler with a call to the production
// multimodal pipeline (structured output over the prompt + locked template
// manifest) described in SPHERE_OF_KINGS_DIGITAL_PLATFORM_IMPLEMENTATION_ROADMAP.md.

interface Body {
  prompt?: string;
  category?: string;
  basePalette?: string[];
}

interface Theme {
  key: RegExp;
  palette: string[];
  themes: string[];
  materials: ("matte" | "glossy" | "metallic" | "glow" | "translucent")[];
  description: string;
}

const THEMES: Theme[] = [
  {
    key: /christ|bible|cross|faith|verse|god|king|royal/i,
    palette: ["#D4AF37", "#FFFFFF", "#1B3A8A", "#4A148C", "#191919", "#C62828", "#2E7D32", "#F5F5DC", "#8B4513"],
    themes: ["royal", "faith", "sacred", "gold leaf"],
    materials: ["metallic", "matte"],
    description:
      "Royal-faith theme with gold, ivory, deep blue and purple. Cross motif centered on the equator, verse engraved on the lid, matching Imperial Kings pieces.",
  },
  {
    key: /sport|team|football|basketball|baseball/i,
    palette: ["#1565C0", "#FFFFFF", "#191919", "#D32F2F", "#FFC107", "#0D47A1", "#9E9E9E", "#F5F5F5", "#BF360C"],
    themes: ["team", "stadium", "bold"],
    materials: ["glossy"],
    description:
      "Bold team palette with contrasting primaries. Logo placement is subject to licensing review before production.",
  },
  {
    key: /holiday|christmas|winter|snow|gift/i,
    palette: ["#D32F2F", "#2E7D32", "#D4AF37", "#FFFFFF", "#8B0000", "#003300", "#C0C0C0", "#4A148C", "#191919"],
    themes: ["holiday", "evergreen", "festive"],
    materials: ["matte", "metallic"],
    description:
      "Festive holiday palette. Lid engraving recommended for family name and year.",
  },
  {
    key: /galaxy|space|cosmic|star|night/i,
    palette: ["#0A0A2A", "#1A237E", "#4A148C", "#FFFFFF", "#F5F5F5", "#D4AF37", "#00ACC1", "#C5CAE9", "#191919"],
    themes: ["cosmic", "stars", "deep"],
    materials: ["glow", "metallic"],
    description:
      "Deep-cosmos palette with glow-in-the-dark accents on constellation points and translucent lid layer.",
  },
];

const DEFAULT: Theme = {
  key: /.*/,
  palette: ["#D4AF37", "#191919", "#FFFFFF", "#D32F2F", "#1565C0", "#2E7D32", "#8E24AA", "#FF8F00", "#00ACC1"],
  themes: ["classic"],
  materials: ["matte"],
  description:
    "Classic Sphere of Kings palette. Nine primary colors mapped to approved customization zones.",
};

function suggestGridFromPalette(palette: string[]): string[][] {
  // Produce a visually distinctive but legal grid using the first few colors.
  // This is intentionally simple so the stub stays deterministic.
  const grid = emptyGrid();
  const [a = "#000000", b = "#FFFFFF", c = "#D4AF37"] = palette;
  for (let r = 0; r < DESIGN_ROWS; r++) {
    for (let col = 0; col < DESIGN_COLS; col++) {
      const band = r % 3;
      grid[r][col] = band === 0 ? a : band === 1 ? b : c;
    }
  }
  return grid;
}

export async function POST(req: Request) {
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });

  let body: Body;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }

  const prompt = (body.prompt ?? "").toString().slice(0, 1000).trim();
  if (!prompt) return NextResponse.json({ error: "prompt required" }, { status: 400 });

  const theme = THEMES.find((t) => t.key.test(prompt)) ?? DEFAULT;
  const grid = suggestGridFromPalette(theme.palette);

  return NextResponse.json({
    suggestion: {
      palette: theme.palette,
      themes: theme.themes,
      materials: theme.materials,
      description: theme.description,
      grid,
    },
    meta: {
      stub: true,
      upgradePath: "Replace with structured-output multimodal AI pipeline.",
    },
  });
}
