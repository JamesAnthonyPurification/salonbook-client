"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Lock, Mail, Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "./DashboardShell";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import ImageInput, { type ImageValue } from "@/components/ui/ImageInput";
import { PageLoader, Spinner } from "@/components/ui/Loader";
import { useApiQuery } from "@/hooks/useApiQuery";
import { api, getErrorMessage, getFieldErrors } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { formatDate } from "@/lib/format";
import { uploadImage } from "@/lib/upload";
import { isHttpUrl } from "@/lib/validation";
import type { UserLite } from "@/lib/types";

export default function ProfileForm() {
  const router = useRouter();
  const { refetch } = useSession();
  const { data: profile, setData, loading, error, reload } = useApiQuery<UserLite>("/users/me");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState<ImageValue>({ mode: "upload", file: null });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "uploading" | "saving">("idle");

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setPhone(profile.phone ?? "");
    }
  }, [profile]);

  if (loading) return <PageLoader label="Loading your profile…" />;
  if (error || !profile) {
    return <EmptyState title="Couldn't load your profile" description={error ?? undefined} action={<button className="btn-primary" onClick={reload}>Retry</button>} />;
  }

  function validate() {
    const e: Record<string, string> = {};
    if (name.trim().length < 2 || name.trim().length > 60) e.name = "Name must be between 2 and 60 characters";
    if (phone.trim() && !/^\+?[0-9\s\-()]{7,20}$/.test(phone.trim())) e.phone = "Please enter a valid phone number";
    if (image.mode === "url" && image.url.trim() && !isHttpUrl(image.url)) e.image = "Please enter a valid image URL";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const payload: Record<string, string> = { name: name.trim(), phone: phone.trim() };
    try {
      if (image.mode === "upload" && image.file) {
        setStatus("uploading");
        payload.image = await uploadImage(image.file);
      } else if (image.mode === "url" && image.url.trim()) {
        payload.image = image.url.trim();
      }
    } catch (err) {
      setStatus("idle");
      const msg = err instanceof Error ? err.message : "Image upload failed";
      setErrors((p) => ({ ...p, image: msg }));
      toast.error(msg);
      return;
    }

    setStatus("saving");
    try {
      const res = await api.patch<{ data: UserLite; message: string }>("/users/me", payload);
      setData(res.data.data);
      setImage(image.mode === "url" ? { mode: "url", url: "" } : { mode: "upload", file: null });
      toast.success(res.data.message || "Profile updated");
      await refetch(); // update navbar/sidebar immediately
      router.refresh();
    } catch (err) {
      setErrors(getFieldErrors(err));
      toast.error(getErrorMessage(err, "Could not update your profile"));
    } finally {
      setStatus("idle");
    }
  }

  const busy = status !== "idle";

  return (
    <>
      <PageHeader title="My Profile" description="Update your personal details and profile photo." />
      <div className="grid gap-6 lg:grid-cols-3">
        <aside className="card h-fit p-6 text-center">
          <div className="flex justify-center">
            <Avatar src={profile.image} name={profile.name} size={96} />
          </div>
          <h2 className="mt-4 font-display text-xl font-semibold">{profile.name}</h2>
          <p className="text-sm text-stone-500">{profile.email}</p>
          <div className="mt-3 flex justify-center gap-2">
            <Badge value={profile.role ?? "customer"} />
            <Badge value={profile.isBlocked ? "blocked" : "active"} />
          </div>
          <ul className="mt-6 space-y-2 border-t border-stone-100 pt-4 text-left text-sm text-stone-600">
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-stone-400" /> {profile.email}</li>
            <li className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-stone-400" /> Member since {formatDate(profile.createdAt)}</li>
          </ul>
        </aside>

        <form onSubmit={handleSubmit} noValidate className="card space-y-5 p-6 lg:col-span-2">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="label">Full name</label>
              <input id="name" className={`input ${errors.name ? "input-error" : ""}`} value={name} onChange={(e) => setName(e.target.value)} />
              {errors.name && <p className="field-error">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="phone" className="label">Phone number</label>
              <input id="phone" type="tel" placeholder="+1 555 123 4567" className={`input ${errors.phone ? "input-error" : ""}`} value={phone} onChange={(e) => setPhone(e.target.value)} />
              {errors.phone && <p className="field-error">{errors.phone}</p>}
            </div>
          </div>

          <div>
            <label className="label inline-flex items-center gap-1.5">
              Email <Lock className="h-3.5 w-3.5 text-stone-400" />
            </label>
            <input className="input" value={profile.email} disabled />
            <p className="mt-1 text-xs text-stone-400">Email, role and account status can&apos;t be changed here.</p>
          </div>

          <ImageInput label="Profile image" value={image} onChange={setImage} allowUrl existingUrl={profile.image} error={errors.image} />

          <div className="flex flex-col-reverse gap-3 border-t border-stone-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="inline-flex items-center gap-1.5 text-xs text-stone-500">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> Changes are verified securely on the server.
            </p>
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? <Spinner /> : <Save className="h-4 w-4" />}
              {status === "uploading" ? "Uploading image…" : status === "saving" ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
