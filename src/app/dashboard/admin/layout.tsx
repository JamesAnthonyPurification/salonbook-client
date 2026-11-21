import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";

/** Only admins may access /dashboard/admin/* — others are sent to their own dashboard. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession("/dashboard/admin");
  if (session.user.role !== "admin") redirect("/dashboard/customer");
  return <>{children}</>;
}
