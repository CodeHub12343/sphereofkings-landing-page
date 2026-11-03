// Which URLs belong to the game app (app chrome: slim top bar + bottom
// tab bar, no marketing header/footer) versus the marketing site.
// Shared by AppChrome and FeaturePage so both agree on every path.

const APP_PREFIXES = [
  "/play",
  "/puzzles",
  "/matches",
  "/match/",
  "/leaderboards",
  "/champions",
  "/tournaments",
  "/u/",
  "/me",
  "/signin",
  "/signup",
];

// Full-screen game screens: tab bar hidden, controls in the game dock.
const GAME_PATTERNS = [
  /^\/play\/(royal-checkers|imperial-kings)\/?$/,
  /^\/puzzles\/[^/]+\/?$/,
  /^\/match\/[^/]+(\/watch|\/replay)?\/?$/,
];

export type AppMode = "site" | "tab" | "game";

function matchesPrefix(pathname: string, prefix: string): boolean {
  if (prefix.endsWith("/")) return pathname.startsWith(prefix);
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function appMode(pathname: string | null): AppMode {
  if (!pathname) return "site";
  if (!APP_PREFIXES.some((p) => matchesPrefix(pathname, p))) return "site";
  return GAME_PATTERNS.some((re) => re.test(pathname)) ? "game" : "tab";
}

export interface AppTab {
  href: string;
  label: string;
  icon: "play" | "puzzle" | "swords" | "trophy" | "user";
}

export const APP_TABS: AppTab[] = [
  { href: "/play", label: "Play", icon: "play" },
  { href: "/puzzles", label: "Puzzles", icon: "puzzle" },
  { href: "/matches", label: "Matches", icon: "swords" },
  { href: "/leaderboards", label: "Ranks", icon: "trophy" },
  { href: "/me", label: "Profile", icon: "user" },
];

/** Which tab lights up for a given path. */
export function activeTab(pathname: string): string | null {
  if (matchesPrefix(pathname, "/puzzles")) return "/puzzles";
  if (pathname === "/matches" || pathname.startsWith("/match/")) return "/matches";
  if (matchesPrefix(pathname, "/leaderboards") || matchesPrefix(pathname, "/champions") || pathname.startsWith("/u/")) {
    return "/leaderboards";
  }
  if (matchesPrefix(pathname, "/me") || matchesPrefix(pathname, "/signin") || matchesPrefix(pathname, "/signup")) {
    return "/me";
  }
  if (matchesPrefix(pathname, "/play") || matchesPrefix(pathname, "/tournaments")) return "/play";
  return null;
}

/**
 * Where the top bar's back arrow goes. Tab roots have no back arrow;
 * everything else goes to its logical parent rather than browser
 * history, so the arrow never exits the app to the marketing site.
 */
export function backHref(pathname: string): string | null {
  if (APP_TABS.some((t) => t.href === pathname)) return null;
  if (pathname.startsWith("/play/")) return "/play";
  if (pathname.startsWith("/puzzles/")) return "/puzzles";
  if (pathname.startsWith("/match/")) return "/matches";
  if (pathname.startsWith("/u/") || pathname === "/champions") return "/leaderboards";
  if (pathname.startsWith("/tournaments/")) return "/tournaments";
  if (pathname.startsWith("/me/")) return "/me";
  return "/play";
}
