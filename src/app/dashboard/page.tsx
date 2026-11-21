import { redirect } from "next/navigation";
import { dashboardHome, requireSession } from "@/lib/session";

export default async function DashboardIndex() {
  const session = await requireSession("/dashboard");
  redirect(dashboardHome(session.user.role));
}
