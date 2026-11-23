import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";

/** Current Better Auth session (deduplicated per request). */
export const getSession = cache(async () => {
  try {
    return await auth.api.getSession({ headers: await headers() });
  } catch (err) {
    console.error("getSession failed:", err);
    return null;
  }
});

export type Role = "admin" | "customer";

export const dashboardHome = (role?: string | null) =>
  role === "admin" ? "/dashboard/admin" : "/dashboard/customer";

/** Redirects to sign-in when there is no session; returns the session otherwise. */
export async function requireSession(redirectTo: string) {
  const session = await getSession();
  if (!session) redirect(`/signin?redirect=${encodeURIComponent(redirectTo)}`);
  return session;
}
