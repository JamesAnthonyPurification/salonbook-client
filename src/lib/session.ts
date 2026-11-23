import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";

/**
 * Current Better Auth session (deduplicated per request).
 * Retries once on failure so a transient database hiccup on a warm serverless
 * instance doesn't wrongly sign the user out of a protected page.
 */
export const getSession = cache(async () => {
  const h = await headers();
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      return await auth.api.getSession({ headers: h });
    } catch (err) {
      console.error(`getSession failed (attempt ${attempt}):`, err);
    }
  }
  return null;
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
