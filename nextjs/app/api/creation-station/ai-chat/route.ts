import { NextResponse } from "next/server";
import { currentPlayer } from "@/lib/auth/player-session";

export const runtime = "nodejs";

// Lightweight conversational design assistant. Phase-1 is rules-based and
// returns deterministic guidance — no external AI calls. Replace with the
// multimodal model when available; the contract (message in / reply out)
// stays identical.

interface Body {
  messages?: { role: "user" | "assistant"; content: string }[];
  context?: {
    title?: string;
    palette?: string[];
    hasImage?: boolean;
    category?: string;
  };
}

const TIPS: { re: RegExp; reply: string }[] = [
  { re: /color|palette|match/i,
    reply: "For a cohesive board, pin 2 anchor colors and let the other 7 derive from them. Metallic finish exaggerates warm colors; glow needs a dark surround to charge." },
  { re: /checker|stack|king/i,
    reply: "Keep the top and bottom checker colors on opposite sides of the wheel so kings read clearly across the room. Engraving over 20 characters crowds the disc face." },
  { re: /verse|bible|scripture|faith/i,
    reply: "Short verses (under 60 characters) engrave cleanly on the lid without wrapping. Royal gold on ivory reads best in direct light." },
  { re: /photo|image|upload/i,
    reply: "Use a high-contrast portrait or landscape. The engine pulls up to 9 dominant colors; if faces matter, crop tight before upload so they map to the lid, not the equator." },
  { re: /price|cost|quote/i,
    reply: "Price scales with distinct manufacturing colors (3 included), finish (metallic +25%, glow +30%), and engraved characters. Switch to matte if you want to keep the base price." },
  { re: /stl|export|file/i,
    reply: "You can download the sphere board and checker STLs once the design is saved. 3MF with per-face color follows after the Python CAD service goes live." },
];

const FALLBACK =
  "Tell me what you're designing — a theme, a recipient, or a feature you want to emphasize — and I'll suggest palette, finish, and layout.";

export async function POST(req: Request) {
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  const body = await req.json().catch(() => ({})) as Body;
  const last = body.messages?.filter((m) => m.role === "user").pop()?.content ?? "";
  const tip = TIPS.find((t) => t.re.test(last));
  const reply = tip ? tip.reply : FALLBACK;
  return NextResponse.json({
    reply,
    meta: { stub: true, upgradePath: "Replace with multimodal assistant tied to design state." },
  });
}
