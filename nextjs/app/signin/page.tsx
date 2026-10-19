import type { Metadata } from "next";
import SigninForm from "./SigninForm";

export const metadata: Metadata = {
  title: "Sign in · Sphere of Kings",
};

export default function SigninPage() {
  return (
    <main style={{ padding: "100px 20px 60px", maxWidth: 420, margin: "0 auto" }}>
      <header style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, color: "var(--text,#f5f0e8)", fontSize: 28 }}>Sign in</h1>
      </header>
      <SigninForm />
    </main>
  );
}
