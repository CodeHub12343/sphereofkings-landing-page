import type { Metadata } from "next";
import SignupForm from "./SignupForm";

export const metadata: Metadata = {
  title: "Create account · Sphere of Kings",
  description: "Create a free player account to track your rating.",
};

export default function SignupPage() {
  return (
    <main style={{ padding: "100px 20px 60px", maxWidth: 480, margin: "0 auto" }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, color: "var(--text,#f5f0e8)", fontSize: 28 }}>Create your account</h1>
        <p style={{ color: "var(--text-muted,#a89880)", marginTop: 8, fontSize: 14 }}>
          Free. Needed for ranked play, saved progress, and profile pages.
          You must be 13 or older.
        </p>
      </header>
      <SignupForm />
    </main>
  );
}
