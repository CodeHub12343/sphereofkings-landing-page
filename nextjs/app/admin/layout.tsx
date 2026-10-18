import type { Metadata } from "next";
import AdminHeader from "@/components/admin/AdminHeader";
import { getAdminSessionInfo } from "@/lib/auth/admin-session";

export const metadata: Metadata = {
  title: "Admin — Sphere of Kings",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const info = await getAdminSessionInfo();
  return (
    <>
      <AdminHeader
        user={
          info.user
            ? {
                displayName: info.user.displayName,
                email: info.user.email,
                role: info.user.role,
              }
            : null
        }
        perAccount={info.perAccount}
      />
      <main style={{ background: "#0a0a0a", minHeight: "calc(100vh - 64px)" }}>
        {children}
      </main>
    </>
  );
}
