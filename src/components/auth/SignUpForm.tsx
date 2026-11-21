"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Check, Eye, EyeOff, X } from "lucide-react";
import { toast } from "sonner";
import { signUp } from "@/lib/auth-client";
import { clearAccessToken } from "@/lib/api";
import { uploadImage } from "@/lib/upload";
import { EMAIL_REGEX, isHttpUrl, validatePassword } from "@/lib/validation";
import { safeRedirect } from "@/lib/redirect";
import { Spinner } from "@/components/ui/Loader";
import ImageInput, { type ImageValue } from "@/components/ui/ImageInput";
import GoogleButton from "./GoogleButton";

const rules = [
  { test: (p: string) => p.length >= 6, label: "At least 6 characters" },
  { test: (p: string) => /[A-Z]/.test(p), label: "One uppercase letter" },
  { test: (p: string) => /[a-z]/.test(p), label: "One lowercase letter" },
];

export default function SignUpForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = safeRedirect(params.get("redirect"));
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [image, setImage] = useState<ImageValue>({ mode: "upload", file: null });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPw, setShowPw] = useState(false);
  const [status, setStatus] = useState<"idle" | "uploading" | "creating">("idle");

  function validate() {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = "Please enter your full name";
    if (!EMAIL_REGEX.test(form.email.trim())) e.email = "Please enter a valid email address";
    const pw = validatePassword(form.password);
    if (pw) e.password = pw;
    if (image.mode === "url" && image.url && !isHttpUrl(image.url)) e.image = "Please enter a valid image URL";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    let imageUrl: string | undefined;
    try {
      if (image.mode === "upload" && image.file) {
        setStatus("uploading");
        imageUrl = await uploadImage(image.file);
      } else if (image.mode === "url" && image.url.trim()) {
        imageUrl = image.url.trim();
      }
    } catch (err) {
      setStatus("idle");
      const msg = err instanceof Error ? err.message : "Image upload failed";
      setErrors((prev) => ({ ...prev, image: msg }));
      toast.error(msg);
      return;
    }

    setStatus("creating");
    const { error } = await signUp.email({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      image: imageUrl,
    });
    if (error) {
      setStatus("idle");
      toast.error(
        error.status === 422 || /exist/i.test(error.message ?? "")
          ? "An account with this email already exists. Try signing in."
          : error.message || "Registration failed. Please try again."
      );
      return;
    }
    clearAccessToken();
    toast.success("Account created! Welcome to SalonBook.");
    router.replace(redirectTo ?? "/dashboard/customer");
    router.refresh();
  }

  const busy = status !== "idle";

  return (
    <div className="space-y-6">
      <GoogleButton callbackURL={redirectTo ?? "/dashboard"} label="Sign up with Google" />
      <div className="flex items-center gap-3 text-xs text-stone-400">
        <span className="h-px flex-1 bg-stone-200" /> or register with email <span className="h-px flex-1 bg-stone-200" />
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="name" className="label">Full name</label>
          <input
            id="name"
            className={`input ${errors.name ? "input-error" : ""}`}
            placeholder="Jane Doe"
            autoComplete="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input
            id="email"
            type="email"
            className={`input ${errors.email ? "input-error" : ""}`}
            placeholder="you@example.com"
            autoComplete="email"
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
              autoComplete="new-password"
              className={`input pr-11 ${errors.password ? "input-error" : ""}`}
              placeholder="Create a password"
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
          <ul className="mt-2 grid gap-1 text-xs sm:grid-cols-3">
            {rules.map((r) => {
              const ok = r.test(form.password);
              return (
                <li key={r.label} className={`flex items-center gap-1 ${ok ? "text-emerald-600" : "text-stone-400"}`}>
                  {ok ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />} {r.label}
                </li>
              );
            })}
          </ul>
          {errors.password && <p className="field-error">{errors.password}</p>}
        </div>

        <ImageInput label="Profile image (optional)" value={image} onChange={setImage} allowUrl error={errors.image} />

        <button type="submit" className="btn-primary w-full py-3" disabled={busy}>
          {busy && <Spinner />}
          {status === "uploading" ? "Uploading image…" : status === "creating" ? "Creating account…" : "Create Account"}
        </button>
      </form>

      <p className="text-center text-sm text-stone-500">
        Already have an account?{" "}
        <Link href={`/signin${redirectTo ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`} className="font-semibold text-brand-700 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
