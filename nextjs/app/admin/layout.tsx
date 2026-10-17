import type { Metadata } from "next";
import AdminHeader from "@/components/admin/AdminHeader";

export const metadata: Metadata = {
  title: "Admin — Sphere of Kings",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AdminHeader />
      <main style={{ background: "#0a0a0a", minHeight: "calc(100vh - 64px)" }}>
        {children}
      </main>
    </>
  );
}
