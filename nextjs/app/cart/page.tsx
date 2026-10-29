// Cart retired in Kickstarter-only mode (James, 2026-10-29). Any
// visitor landing on /cart is sent to the reward preview, which has
// its own Kickstarter CTA.

import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "On Kickstarter · Sphere of Kings",
  robots: { index: false, follow: false },
};

export default function CartRedirectPage() {
  redirect("/shop");
}
