import { redirect } from "next/navigation";
import { currentPlayer } from "@/lib/auth/player-session";
import FeaturePage from "@/components/feature/FeaturePage";
import { FBanner } from "@/components/feature/primitives";
import { flag } from "@/lib/feature-flags";
import ApplicationForm from "./ApplicationForm";

export const dynamic = "force-dynamic";

export default async function LicenseApplyPage() {
  const me = await currentPlayer();
  if (!me) redirect("/signin?next=/license/apply");
  if (!flag("licensingMarketplace")) {
    return (
      <FeaturePage
        eyebrow="Designer Licensing"
        title="Applications open soon"
        subtitle="The license agreement and NDA are still under counsel review. We'll notify you by email the moment applications open."
        centered narrow
      >
        <FBanner $tone="info">
          You're signed in as <strong style={{ color: "var(--gold-light,#f0c040)" }}>{me.displayName}</strong>.
          You'll be the first to hear when the application button goes live.
        </FBanner>
      </FeaturePage>
    );
  }
  return (
    <FeaturePage
      eyebrow="Designer Licensing · Application"
      title="Submit your design"
      subtitle="Upload your finished sphere, propose a retail price, and tell us about the design. Our review takes 7–10 business days."
      narrow
    >
      <ApplicationForm playerDisplayName={me.displayName} playerEmail={me.emailLower} />
    </FeaturePage>
  );
}
