import { redirect } from "next/navigation";

// Short-URL alias. The main nav links to /create so it reads naturally;
// the actual editor lives under /sphere/creation-station. A 308 (permanent)
// keeps crawlers happy; redirect() with no options sends a 307 which is
// fine for navigation but we want the stronger signal here.
export default function CreateAlias() {
  redirect("/sphere/creation-station");
}
