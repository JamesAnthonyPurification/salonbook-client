import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import SignUpForm from "@/components/auth/SignUpForm";
import { PageLoader } from "@/components/ui/Loader";
import { getSession, dashboardHome } from "@/lib/session";

export const metadata: Metadata = { title: "Sign Up" };

export default async function SignUpPage() {
  const session = await getSession();
  if (session) redirect(dashboardHome(session.user.role));

  return (
    <AuthShell title="Create your account" subtitle="Join SalonBook and book your next appointment in minutes.">
      <Suspense fallback={<PageLoader />}>
        <SignUpForm />
      </Suspense>
    </AuthShell>
  );
}
