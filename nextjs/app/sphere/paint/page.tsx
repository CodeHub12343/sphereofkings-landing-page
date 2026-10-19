import { redirect } from "next/navigation";
import nextDynamic from "next/dynamic";
import { currentPlayer } from "@/lib/auth/player-session";
import PaintStudio from "./PaintStudio";

export const metadata = { title: "Sphere Painter · Sphere of Kings" };
export const dynamic = "force-dynamic";

export default async function PaintPage() {
  const me = await currentPlayer();
  if (!me) redirect("/signin?next=/sphere/paint");
  return (
    <main style={{ padding: "100px 20px 60px", maxWidth: 1100, margin: "0 auto" }}>
      <header style={{ marginBottom: 20 }}>
        <p style={{ color: "var(--gold,#c9a227)", fontSize: 13, letterSpacing: ".12em",
                    textTransform: "uppercase", margin: "0 0 6px" }}>Design · Sphere Painter</p>
        <h1 style={{ margin: 0, color: "var(--text,#f5f0e8)", fontSize: 28 }}>Paint your sphere</h1>
        <p style={{ color: "var(--text-muted,#a89880)", maxWidth: 680, marginTop: 8 }}>
          Paint the 14×8 play surface. The 3D preview updates live. Save your design, then
          order a custom physical sphere.
        </p>
      </header>
      <PaintStudio />
    </main>
  );
}
