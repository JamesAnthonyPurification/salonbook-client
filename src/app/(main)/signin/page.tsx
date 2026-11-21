import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import SignInForm from "@/components/auth/SignInForm";
import { PageLoader } from "@/components/ui/Loader";
import { getSession, dashboardHome } from "@/lib/session";

export const metadata: Metadata = { title: "Sign In" };

export default async function SignInPage() {
  const session = await getSession();
  if (session) redirect(dashboardHome(session.user.role));

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to manage your salon appointments.">
      <Suspense fallback={<PageLoader />}>
        <SignInForm />
      </Suspense>
    </AuthShell>
  );
}
