// URL normalization and canonical-id extraction for social posts.
// Accepts the four supported platforms and rejects everything else.
// The goal is a stable (platform, canonicalId) tuple so a creator
// cannot earn duplicate credit by submitting the same post under a
// shortened URL, mobile share URL, or query-string variant.

export type Platform = "tiktok" | "instagram" | "facebook" | "youtube";

export interface ParsedPost {
  platform: Platform;
  handle: string;
  canonicalId: string;
  normalizedUrl: string;
}

export class PostParseError extends Error {}

export function parsePostUrl(input: string): ParsedPost {
  let url: URL;
  try { url = new URL(input.trim()); }
  catch { throw new PostParseError("Invalid URL."); }

  const host = url.hostname.replace(/^www\./, "").toLowerCase();

  // TikTok: tiktok.com/@handle/video/1234, vm.tiktok.com/XXXX/
  if (host.endsWith("tiktok.com")) {
    const m = url.pathname.match(/^\/@([^/]+)\/video\/(\d+)/);
    if (m) {
      return {
        platform: "tiktok", handle: m[1], canonicalId: m[2],
        normalizedUrl: `https://www.tiktok.com/@${m[1]}/video/${m[2]}`,
      };
    }
    // short links — we accept but canonicalize on path segment
    const short = url.pathname.replace(/\/+$/, "").split("/").pop();
    if (short) {
      return {
        platform: "tiktok", handle: "", canonicalId: `short:${short}`,
        normalizedUrl: `https://vm.tiktok.com/${short}/`,
      };
    }
    throw new PostParseError("TikTok URL not recognized.");
  }

  // Instagram: instagram.com/p/XXXX/, /reel/XXXX/, /tv/XXXX/
  if (host.endsWith("instagram.com")) {
    const m = url.pathname.match(/^\/(p|reel|reels|tv)\/([^/]+)/);
    if (m) {
      const id = m[2];
      return {
        platform: "instagram", handle: "", canonicalId: id,
        normalizedUrl: `https://www.instagram.com/p/${id}/`,
      };
    }
    throw new PostParseError("Instagram URL not recognized (need /p/, /reel/, or /tv/).");
  }

  // Facebook: facebook.com/{handle}/posts/{id}, /videos/{id}, /{handle}/posts/pfbid...
  if (host.endsWith("facebook.com") || host.endsWith("fb.watch")) {
    if (host.endsWith("fb.watch")) {
      const slug = url.pathname.replace(/\/+/g, "").trim();
      if (slug) return { platform: "facebook", handle: "", canonicalId: `short:${slug}`, normalizedUrl: `https://fb.watch/${slug}/` };
    }
    const parts = url.pathname.replace(/^\/+/, "").split("/");
    const handle = parts[0] ?? "";
    const kind = parts[1];
    const id = parts[2];
    if (handle && (kind === "posts" || kind === "videos") && id) {
      return {
        platform: "facebook", handle, canonicalId: id,
        normalizedUrl: `https://www.facebook.com/${handle}/${kind}/${id}`,
      };
    }
    throw new PostParseError("Facebook URL not recognized.");
  }

  // YouTube: youtube.com/watch?v=XXXX, youtu.be/XXXX, youtube.com/shorts/XXXX
  if (host.endsWith("youtube.com") || host.endsWith("youtu.be")) {
    let id: string | null = null;
    if (host.endsWith("youtu.be")) {
      id = url.pathname.replace(/^\/+/, "").split("/")[0] ?? null;
    } else if (url.pathname.startsWith("/watch")) {
      id = url.searchParams.get("v");
    } else if (url.pathname.startsWith("/shorts/")) {
      id = url.pathname.split("/")[2] ?? null;
    }
    if (id) {
      return {
        platform: "youtube", handle: "", canonicalId: id,
        normalizedUrl: `https://www.youtube.com/watch?v=${id}`,
      };
    }
    throw new PostParseError("YouTube URL not recognized.");
  }

  throw new PostParseError("Only TikTok, Instagram, Facebook, and YouTube URLs are accepted.");
}
