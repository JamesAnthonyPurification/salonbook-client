"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { signIn } from "@/lib/auth-client";
import { clearAccessToken } from "@/lib/api";
import { EMAIL_REGEX } from "@/lib/validation";
import { roleHome, safeRedirect } from "@/lib/redirect";
import { Spinner } from "@/components/ui/Loader";
import GoogleButton from "./GoogleButton";

export default function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = safeRedirect(params.get("redirect"));
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  // Errors coming back from the Google OAuth flow (e.g. blocked account)
  useEffect(() => {
    const err = params.get("error");
    if (err) {
      toast.error(
        /block/i.test(err) || err === "FORBIDDEN"
          ? "Your account has been blocked. Please contact the salon."
          : "Google sign-in failed. Please try again."
      );
    }
  }, [params]);

  function validate() {
    const e: Record<string, string> = {};
    if (!EMAIL_REGEX.test(form.email.trim())) e.email = "Please enter a valid email address";
    if (!form.password) e.password = "Please enter your password";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const { data, error } = await signIn.email({ email: form.email.trim(), password: form.password });
    if (error) {
      setLoading(false);
      toast.error(
        error.status === 401 ? "Invalid email or password" : error.message || "Sign in failed. Please try again."
      );
      return;
    }
    clearAccessToken();
    toast.success(`Welcome back, ${data?.user.name?.split(" ")[0] ?? "there"}!`);
    const role = (data?.user as { role?: string } | undefined)?.role;
    router.replace(redirectTo && role !== "admin" ? redirectTo : roleHome(role));
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <GoogleButton callbackURL={redirectTo ?? "/dashboard"} />
      <div className="flex items-center gap-3 text-xs text-stone-400">
        <span className="h-px flex-1 bg-stone-200" /> or sign in with email <span className="h-px flex-1 bg-stone-200" />
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={`input ${errors.email ? "input-error" : ""}`}
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="password" className="label">Password</label>
          <div className="relative">
            <input
              id="password"
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              className={`input pr-11 ${errors.password ? "input-error" : ""}`}
              placeholder="Your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute inset-y-0 right-0 px-3 text-stone-400 hover:text-stone-600"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="field-error">{errors.password}</p>}
        </div>
        <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
          {loading && <Spinner />} {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <p className="text-center text-sm text-stone-500">
        New to SalonBook?{" "}
        <Link href={`/signup${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`} className="font-semibold text-brand-700 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
