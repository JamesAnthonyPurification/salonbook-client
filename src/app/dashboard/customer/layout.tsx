import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";

/** Only customers may access /dashboard/customer/* — admins are sent to the admin dashboard. */
export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession("/dashboard/customer");
  if (session.user.role === "admin") redirect("/dashboard/admin");
  return <>{children}</>;
}
