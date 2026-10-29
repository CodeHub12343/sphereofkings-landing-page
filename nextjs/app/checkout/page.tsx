// Direct checkout is retired in Kickstarter-only mode (James,
// 2026-10-29). Any visitor landing on /checkout is sent to the
// Kickstarter campaign; a tiny holding page shows briefly while the
// redirect fires so the request doesn't look broken if the Kickstarter
// link is misconfigured.

import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "On Kickstarter · Sphere of Kings",
  robots: { index: false, follow: false },
};

export default function CheckoutRedirectPage() {
  const url = process.env.NEXT_PUBLIC_KICKSTARTER_URL;
  if (url && url.startsWith("http")) {
    redirect(url);
  }
  // Fallback — no Kickstarter URL configured yet; send them to the
  // reward preview instead of a dead checkout flow.
  redirect("/shop");
}
