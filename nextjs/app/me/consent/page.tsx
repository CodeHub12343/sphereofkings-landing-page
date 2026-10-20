import { redirect } from "next/navigation";
import { currentPlayer } from "@/lib/auth/player-session";
import FeaturePage from "@/components/feature/FeaturePage";
import { FBanner } from "@/components/feature/primitives";
import ConsentRequestForm from "./ConsentRequestForm";

export const dynamic = "force-dynamic";

export default async function MyConsentPage() {
  const me = await currentPlayer();
  if (!me) redirect("/signin?next=/me/consent");
  if (!me.isMinor) {
    return (
      <FeaturePage eyebrow="Account" title="No consent required"
                   subtitle="Your account is already an adult account." centered narrow>
        <div />
      </FeaturePage>
    );
  }
  if (me.consentStatus === "parental-granted") {
    return (
      <FeaturePage eyebrow="Account" title="Consent granted"
                   subtitle="You have full access to messaging and challenges." centered narrow>
        <FBanner $tone="success">Welcome aboard.</FBanner>
      </FeaturePage>
    );
  }
  return (
    <FeaturePage
      eyebrow="Account"
      title="Parental consent"
      subtitle="Enter a parent or guardian's email. We'll send them a one-time link to complete the $0.50 (refunded) verification charge."
      centered
      narrow
    >
      <ConsentRequestForm />
    </FeaturePage>
  );
}
