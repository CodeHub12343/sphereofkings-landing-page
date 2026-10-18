import { NextResponse } from "next/server";
import { countConsented } from "@/lib/store/subscribers-store";

// Public endpoint used by the landing-page counter. Returns the live
// count of consented subscribers from the app-side store. The old
// third-party hit counter is deprecated.
export async function GET() {
  const count = await countConsented();
  return NextResponse.json(
    { count },
    {
      headers: {
        // Short cache so a fresh signup appears within seconds on the
        // next page view.
        "Cache-Control": "public, max-age=10, s-maxage=10",
      },
    },
  );
}
