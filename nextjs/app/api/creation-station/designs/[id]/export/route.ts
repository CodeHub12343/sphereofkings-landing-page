import { currentPlayer } from "@/lib/auth/player-session";
import { getCreation } from "@/lib/db/collections/creation-designs";
import { exportBundle, exportSphereBoardSTL, exportCheckerSetSTL } from "@/lib/creation-station/stl-export";

export const runtime = "nodejs";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const me = await currentPlayer();
  if (!me) return new Response("not signed in", { status: 401 });
  const { id } = await params;
  const c = await getCreation(id);
  if (!c) return new Response("not found", { status: 404 });
  if (c.playerId !== me.id && !c.isPublic) return new Response("forbidden", { status: 403 });

  const url = new URL(req.url);
  const part = url.searchParams.get("part") ?? "board";

  if (part === "board") {
    const bytes = exportSphereBoardSTL(c.grid);
    return new Response(new Uint8Array(bytes), {
      headers: {
        "content-type": "model/stl",
        "content-disposition": `attachment; filename="${safe(c.title)}-sphere-board.stl"`,
      },
    });
  }
  if (part === "checkers") {
    const { topColor, bottomColor, crown, crownColor } = c.config.checker;
    const bytes = exportCheckerSetSTL(topColor, bottomColor, crown, crownColor);
    return new Response(new Uint8Array(bytes), {
      headers: {
        "content-type": "model/stl",
        "content-disposition": `attachment; filename="${safe(c.title)}-checker.stl"`,
      },
    });
  }
  if (part === "manifest") {
    // Machine-readable bundle manifest.
    const bundle = exportBundle(c.grid, { checker: c.config.checker });
    return new Response(JSON.stringify({
      creationId: c.id,
      title: c.title,
      files: bundle.files.map((f) => ({ name: f.name, bytes: f.bytes.length })),
      palette: c.config.palette,
      finish: c.config.finish,
      personalization: c.config.personal,
    }, null, 2), { headers: { "content-type": "application/json" } });
  }
  return new Response("unknown part", { status: 400 });
}

function safe(s: string) {
  return (s || "creation").replace(/[^a-z0-9-_]+/gi, "-").toLowerCase().slice(0, 48);
}
