import type { Metadata } from "next";
import FeaturePage from "@/components/feature/FeaturePage";
import SigninForm from "./SigninForm";

export const metadata: Metadata = { title: "Sign in · Sphere of Kings" };

export default async function SigninPage(
  { searchParams }: { searchParams: Promise<{ next?: string }> },
) {
  const { next } = await searchParams;
  return (
    <FeaturePage
      eyebrow="Return to the court"
      title="Sign in"
      centered
      narrow
    >
      <SigninForm next={next} />
    </FeaturePage>
  );
}
