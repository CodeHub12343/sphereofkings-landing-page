import type { Metadata } from "next";
import FeaturePage from "@/components/feature/FeaturePage";
import SigninForm from "./SigninForm";

export const metadata: Metadata = { title: "Sign in · Sphere of Kings" };

export default function SigninPage() {
  return (
    <FeaturePage
      eyebrow="Return to the court"
      title="Sign in"
      centered
      narrow
    >
      <SigninForm />
    </FeaturePage>
  );
}
