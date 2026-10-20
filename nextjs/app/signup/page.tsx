import type { Metadata } from "next";
import FeaturePage from "@/components/feature/FeaturePage";
import SignupForm from "./SignupForm";

export const metadata: Metadata = {
  title: "Create account · Sphere of Kings",
  description: "Create a free player account to track your rating.",
};

export default function SignupPage() {
  return (
    <FeaturePage
      eyebrow="Join the court"
      title="Create your account"
      subtitle="Free. Needed for ranked play, saved progress, and profile pages. You must be 13 or older."
      centered
      narrow
    >
      <SignupForm />
    </FeaturePage>
  );
}
