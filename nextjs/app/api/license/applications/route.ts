import { NextResponse } from "next/server";
import { currentPlayer } from "@/lib/auth/player-session";
import {
  createApplication, ensureLicensingIndexes, listApplications,
} from "@/lib/db/collections/licensing";
import { flag } from "@/lib/feature-flags";
import { putBlob } from "@/lib/blob";

export const runtime = "nodejs";

export async function GET() {
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "sign in" }, { status: 401 });
  const mine = await listApplications({ playerId: me.id });
  return NextResponse.json({ applications: mine });
}

export async function POST(req: Request) {
  if (!flag("licensingMarketplace")) {
    return NextResponse.json({ error: "Applications are not open yet." }, { status: 503 });
  }
  const me = await currentPlayer();
  if (!me) return NextResponse.json({ error: "sign in" }, { status: 401 });

  let body: {
    title?: string; description?: string;
    proposedPriceDollars?: number; ipDisclosure?: string;
    photoDataUrls?: string[]; agreeTerms?: boolean;
  };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }

  if (!body.agreeTerms) return NextResponse.json({ error: "Must agree to terms" }, { status: 400 });
  const title = (body.title ?? "").trim();
  const description = (body.description ?? "").trim();
  const ipDisclosure = (body.ipDisclosure ?? "").trim();
  const price = Number(body.proposedPriceDollars);
  if (title.length < 3) return NextResponse.json({ error: "Title too short" }, { status: 400 });
  if (description.length < 20) return NextResponse.json({ error: "Description too short" }, { status: 400 });
  if (ipDisclosure.length < 20) return NextResponse.json({ error: "IP disclosure too short" }, { status: 400 });
  if (!Number.isFinite(price) || price < 10 || price > 9999) {
    return NextResponse.json({ error: "Proposed price must be between $10 and $9,999" }, { status: 400 });
  }
  if (!body.photoDataUrls || body.photoDataUrls.length === 0) {
    return NextResponse.json({ error: "Add at least one photo" }, { status: 400 });
  }
  if (body.photoDataUrls.length > 10) {
    return NextResponse.json({ error: "Max 10 photos" }, { status: 400 });
  }

  await ensureLicensingIndexes().catch(() => {});

  // Push photos to Blob storage if configured; otherwise embed data URLs.
  const photoUrls: string[] = [];
  for (let i = 0; i < body.photoDataUrls.length; i++) {
    const d = body.photoDataUrls[i];
    const m = /^data:(image\/\w+);base64,(.*)$/.exec(d);
    if (!m) continue;
    const buf = Buffer.from(m[2], "base64");
    const url = await putBlob(`license/${me.id}/${Date.now()}-${i}.${m[1].split("/")[1]}`, buf, m[1]);
    photoUrls.push(url ?? d);
  }

  const app = await createApplication({
    playerId: me.id,
    playerDisplayName: me.displayName,
    playerEmail: me.emailLower,
    title, description,
    proposedPriceCents: Math.round(price * 100),
    ipDisclosure,
    photoUrls,
  });

  return NextResponse.json({ ok: true, applicationId: app.id });
}
