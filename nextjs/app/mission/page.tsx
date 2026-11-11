import type { Metadata } from "next";
import MissionPage from "@/components/mission/MissionPage";

export const metadata: Metadata = {
  title: "Our Mission & Giving Back · Sphere of Kings",
  description:
    "Creative Design Networks commits 10% of Sphere of Kings Kickstarter net earnings to House of Rest Church in Modesto, California.",
  openGraph: {
    title: "Playing for a Purpose. Building a Better World.",
    description:
      "10% of Sphere of Kings Kickstarter net earnings pledged to House of Rest Church in Modesto, California.",
    url: "https://sphereofkings.com/mission",
    siteName: "Sphere of Kings",
    type: "article",
  },
};

export default function Page() {
  return <MissionPage />;
}
