// Lightweight i18n. Deliberately small — no external dependency.
//
// Locale resolution: cookie `sok_locale` > Accept-Language > fallback "en".
// Dictionaries live in lib/i18n/dict/<locale>.ts. English is the source
// of truth; other locales may be partial — missing keys fall through
// to English rather than throwing.

import { cookies, headers } from "next/headers";
import { en } from "./dict/en";
import { es } from "./dict/es";

export const SUPPORTED_LOCALES = ["en", "es", "fr", "pt"] as const;
export type Locale = typeof SUPPORTED_LOCALES[number];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "sok_locale";

const DICTS: Record<Locale, Partial<Record<string, string>>> = {
  en, es,
  // fr / pt not yet seeded; English fallback handles them.
  fr: {}, pt: {},
};

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  pt: "Português",
};

function parseAcceptLanguage(h: string | null): Locale | null {
  if (!h) return null;
  const prefs = h.split(",")
    .map((p) => p.split(";")[0].trim().toLowerCase().slice(0, 2))
    .filter(Boolean);
  for (const p of prefs) {
    if ((SUPPORTED_LOCALES as readonly string[]).includes(p)) return p as Locale;
  }
  return null;
}

export async function resolveLocale(): Promise<Locale> {
  const jar = await cookies();
  const fromCookie = jar.get(LOCALE_COOKIE)?.value;
  if (fromCookie && (SUPPORTED_LOCALES as readonly string[]).includes(fromCookie)) {
    return fromCookie as Locale;
  }
  const h = await headers();
  return parseAcceptLanguage(h.get("accept-language")) ?? DEFAULT_LOCALE;
}

/**
 * `t(key, params?)` — looks up the key in the current locale, falls
 * back to English. `params` interpolates `{name}` placeholders. Keys
 * are flat strings like "signup.title" or "match.your-turn".
 */
export function translator(locale: Locale) {
  const dict = DICTS[locale] ?? {};
  return function t(key: string, params?: Record<string, string | number>): string {
    const raw = dict[key] ?? (en as Record<string, string>)[key] ?? key;
    if (!params) return raw;
    return raw.replace(/\{(\w+)\}/g, (_, name) =>
      params[name] !== undefined ? String(params[name]) : `{${name}}`);
  };
}

export async function t(key: string, params?: Record<string, string | number>): Promise<string> {
  const locale = await resolveLocale();
  return translator(locale)(key, params);
}
