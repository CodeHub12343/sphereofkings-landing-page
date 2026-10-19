#!/usr/bin/env node
const md = await import("../lib/markdown.ts");
const ve = await import("../lib/vlog-embed.ts");

// Markdown rendering
const html = md.renderMarkdown(`# Hello
This is a **bold** paragraph with *italic* and \`code\`.

- one
- two

\`\`\`
raw code block
\`\`\`

> a quote

[link](https://example.com)`);
console.log("rendered length:", html.length);
if (!html.includes("<h1>Hello</h1>")) { console.error("FAIL: no h1"); process.exit(1); }
if (!html.includes("<strong>bold</strong>")) { console.error("FAIL: no bold"); process.exit(1); }
if (!html.includes("<ul>")) { console.error("FAIL: no list"); process.exit(1); }
if (!html.includes("<pre><code>")) { console.error("FAIL: no code block"); process.exit(1); }
if (!html.includes("<blockquote>")) { console.error("FAIL: no blockquote"); process.exit(1); }
if (!html.includes("rel=\"nofollow noopener\"")) { console.error("FAIL: no link rel"); process.exit(1); }

// Script tag defense
const scriptAttempt = md.renderMarkdown("hello <script>alert(1)</script>");
if (!scriptAttempt.includes("blocked")) { console.error("FAIL: script not blocked"); process.exit(1); }
console.log("markdown OK");

// Vlog parsing
const yt = ve.parseVlogEmbed("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
if (!yt || yt.host !== "youtube") { console.error("FAIL: yt watch"); process.exit(1); }
const ytshort = ve.parseVlogEmbed("https://youtu.be/dQw4w9WgXcQ");
if (!ytshort || ytshort.host !== "youtube") { console.error("FAIL: yt short"); process.exit(1); }
const vim = ve.parseVlogEmbed("https://vimeo.com/123456789");
if (!vim || vim.host !== "vimeo") { console.error("FAIL: vimeo"); process.exit(1); }
const unknown = ve.parseVlogEmbed("https://evil.example.com/video");
if (unknown !== null) { console.error("FAIL: evil accepted"); process.exit(1); }
console.log("vlog parsing OK");
