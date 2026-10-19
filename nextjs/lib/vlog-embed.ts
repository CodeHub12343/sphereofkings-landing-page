// Convert a user-supplied vlog URL into a safe iframe src for the
// recognised hosts (YouTube, Vimeo). Unknown hosts return null and
// the caller renders a plain external link instead.

export interface VlogEmbed { src: string; host: "youtube" | "vimeo"; }

export function parseVlogEmbed(raw: string | undefined): VlogEmbed | null {
  if (!raw) return null;
  let url: URL;
  try { url = new URL(raw); } catch { return null; }
  const host = url.hostname.replace(/^www\./, "");

  if (host === "youtube.com" || host === "m.youtube.com") {
    const id = url.searchParams.get("v");
    if (!id || !/^[\w-]{6,15}$/.test(id)) return null;
    return { src: `https://www.youtube-nocookie.com/embed/${id}`, host: "youtube" };
  }
  if (host === "youtu.be") {
    const id = url.pathname.replace(/^\//, "");
    if (!/^[\w-]{6,15}$/.test(id)) return null;
    return { src: `https://www.youtube-nocookie.com/embed/${id}`, host: "youtube" };
  }
  if (host === "vimeo.com") {
    const id = url.pathname.replace(/^\//, "").split("/")[0];
    if (!/^\d+$/.test(id)) return null;
    return { src: `https://player.vimeo.com/video/${id}`, host: "vimeo" };
  }
  return null;
}
