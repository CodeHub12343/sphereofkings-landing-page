// Minimal, deliberately-small Markdown-to-HTML renderer. Scope: the
// blog post body only, which comes from the admin (trusted). We DO
// NOT render comment bodies through this — comments stay as escaped
// plain text with line breaks, since they come from untrusted users.
//
// Supports: ATX headings (#..######), paragraphs, blank-line breaks,
// unordered lists (- ...), bold **x**, italic *x*, inline code `x`,
// fenced code blocks, links [text](url), images ![alt](url),
// blockquotes (>). Rejects any raw <script> tag defensively even
// though the input is trusted — belt + suspenders.

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function inline(s: string): string {
  // code first so other inline rules do not mangle it
  s = s.replace(/`([^`]+)`/g, (_, c) => `<code>${escapeHtml(c)}</code>`);
  // image
  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, url) =>
    `<img src="${escapeHtml(url)}" alt="${escapeHtml(alt)}" />`);
  // link
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) =>
    `<a href="${escapeHtml(url)}" rel="nofollow noopener">${escapeHtml(text)}</a>`);
  // bold / italic
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
  return s;
}

export function renderMarkdown(md: string): string {
  if (!md) return "";
  // Hard rejection — even trusted input never contains a script tag.
  if (/<script\b/i.test(md)) {
    return "<p><em>[blocked: inline script detected]</em></p>";
  }
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // Fenced code block
    if (line.startsWith("```")) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        buf.push(lines[i]); i++;
      }
      i++;
      out.push(`<pre><code>${escapeHtml(buf.join("\n"))}</code></pre>`);
      continue;
    }
    // Heading
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      const level = h[1].length;
      out.push(`<h${level}>${inline(escapeHtml(h[2]))}</h${level}>`);
      i++; continue;
    }
    // Blockquote
    if (line.startsWith("> ")) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        buf.push(lines[i].slice(2)); i++;
      }
      out.push(`<blockquote>${inline(escapeHtml(buf.join(" ")))}</blockquote>`);
      continue;
    }
    // Unordered list
    if (/^-\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^-\s+/.test(lines[i])) {
        items.push(`<li>${inline(escapeHtml(lines[i].replace(/^-\s+/, "")))}</li>`);
        i++;
      }
      out.push(`<ul>${items.join("")}</ul>`);
      continue;
    }
    // Blank line
    if (line.trim() === "") { i++; continue; }
    // Paragraph (gather until blank line)
    const buf: string[] = [line];
    i++;
    while (i < lines.length && lines[i].trim() !== "" && !/^(#{1,6})\s/.test(lines[i])
           && !lines[i].startsWith("```") && !/^-\s+/.test(lines[i])
           && !lines[i].startsWith("> ")) {
      buf.push(lines[i]); i++;
    }
    out.push(`<p>${inline(escapeHtml(buf.join(" ")))}</p>`);
  }
  return out.join("\n");
}
