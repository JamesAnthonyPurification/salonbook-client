import type { Metadata } from "next";
import DashboardShell from "@/components/dashboard/DashboardShell";
import BlockedNotice from "@/components/dashboard/BlockedNotice";
import { requireSession } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { default: "Dashboard", template: "%s | SalonBook Dashboard" } };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Verified on the server for every request, so private routes survive a page refresh
  const session = await requireSession("/dashboard");
  const { user } = session;

  if (user.isBlocked) return <BlockedNotice />;

  return (
    <DashboardShell
      user={{
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role === "admin" ? "admin" : "customer",
      }}
    >
      {children}
    </DashboardShell>
  );
}
