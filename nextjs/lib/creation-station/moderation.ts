// Lightweight IP / policy moderation for text and image uploads.
// Regex-based, intentionally conservative. Returns a list of flags the
// admin queue can act on. Production should chain a real moderation API.

const BRANDED: { tag: string; re: RegExp }[] = [
  { tag: "sports-league",   re: /\b(nfl|nba|mlb|nhl|fifa|uefa|olymp)\b/i },
  { tag: "entertainment",   re: /\b(disney|marvel|pixar|star[\s-]?wars|pokemon|harry[\s-]?potter)\b/i },
  { tag: "consumer-brand",  re: /\b(nike|adidas|apple|google|microsoft|coca[\s-]?cola|pepsi)\b/i },
  { tag: "automotive",      re: /\b(ferrari|lamborghini|porsche|tesla|bmw|mercedes)\b/i },
];

const UNSAFE: { tag: string; re: RegExp }[] = [
  { tag: "hate",            re: /\b(nazi|kkk|white[\s-]?power)\b/i },
  { tag: "violence",        re: /\b(behead|massacre|lynch)\b/i },
];

export interface ModerationResult {
  state: "clear" | "flagged" | "blocked";
  flags: string[];
  notes: string[];
}

export function moderateText(...parts: (string | undefined | null)[]): ModerationResult {
  const text = parts.filter((p): p is string => !!p).join(" ").toLowerCase();
  if (!text.trim()) return { state: "clear", flags: [], notes: [] };
  const flags: string[] = [];
  const notes: string[] = [];
  for (const { tag, re } of BRANDED) {
    if (re.test(text)) { flags.push(`ip:${tag}`); notes.push(`Possible protected ${tag} reference.`); }
  }
  let blocked = false;
  for (const { tag, re } of UNSAFE) {
    if (re.test(text)) { flags.push(`unsafe:${tag}`); notes.push(`Disallowed ${tag} content.`); blocked = true; }
  }
  if (blocked) return { state: "blocked", flags, notes };
  if (flags.length) return { state: "flagged", flags, notes };
  return { state: "clear", flags, notes };
}
