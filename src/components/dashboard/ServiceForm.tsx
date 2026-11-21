"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { toast } from "sonner";
import ImageInput, { type ImageValue } from "@/components/ui/ImageInput";
import { Spinner } from "@/components/ui/Loader";
import { api, getErrorMessage, getFieldErrors } from "@/lib/api";
import { CATEGORY_NAMES } from "@/lib/constants";
import { uploadImage } from "@/lib/upload";
import type { Service } from "@/lib/types";

export default function ServiceForm({ service }: { service?: Service }) {
  const router = useRouter();
  const isEdit = Boolean(service);
  const [form, setForm] = useState({
    serviceName: service?.serviceName ?? "",
    category: service?.category ?? "",
    description: service?.description ?? "",
    price: service ? String(service.price) : "",
    duration: service ? String(service.duration) : "",
    status: service?.status ?? "active",
  });
  const [image, setImage] = useState<ImageValue>({ mode: "upload", file: null });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "uploading" | "saving">("idle");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function validate() {
    const e: Record<string, string> = {};
    if (!form.serviceName.trim()) e.serviceName = "Service name is required";
    else if (form.serviceName.trim().length > 100) e.serviceName = "Max 100 characters";
    if (!CATEGORY_NAMES.includes(form.category)) e.category = "Please choose a category";
    if (form.description.trim().length < 10) e.description = "Description must be at least 10 characters";
    const price = Number(form.price);
    if (!form.price || !Number.isFinite(price) || price <= 0) e.price = "Price must be a positive number";
    const duration = Number(form.duration);
    if (!form.duration || !Number.isInteger(duration) || duration <= 0) e.duration = "Duration must be a positive whole number";
    if (!isEdit && !(image.mode === "upload" && image.file)) e.image = "Please upload a service image";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    let imageUrl = service?.image;
    if (image.mode === "upload" && image.file) {
      try {
        setStatus("uploading");
        imageUrl = await uploadImage(image.file);
      } catch (err) {
        setStatus("idle");
        const msg = err instanceof Error ? err.message : "Image upload failed";
        setErrors((p) => ({ ...p, image: msg }));
        toast.error(msg);
        return;
      }
    }

    setStatus("saving");
    const payload = {
      serviceName: form.serviceName.trim(),
      category: form.category,
      description: form.description.trim(),
      price: Number(form.price),
      duration: Number(form.duration),
      status: form.status,
      image: imageUrl,
    };
    try {
      if (isEdit) await api.patch(`/services/${service!._id}`, payload);
      else await api.post("/services", payload);
      toast.success(isEdit ? "Service updated successfully" : "Service created successfully");
      router.push("/dashboard/admin/services");
      router.refresh();
    } catch (err) {
      setErrors(getFieldErrors(err));
      toast.error(getErrorMessage(err, "Could not save the service"));
      setStatus("idle");
    }
  }

  const busy = status !== "idle";

  return (
    <form onSubmit={handleSubmit} noValidate className="card space-y-5 p-5 sm:p-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="serviceName" className="label">Service name</label>
          <input id="serviceName" className={`input ${errors.serviceName ? "input-error" : ""}`} value={form.serviceName} onChange={set("serviceName")} placeholder="e.g. Signature Haircut & Blow-Dry" />
          {errors.serviceName && <p className="field-error">{errors.serviceName}</p>}
        </div>

        <div>
          <label htmlFor="category" className="label">Category</label>
          <select id="category" className={`input ${errors.category ? "input-error" : ""}`} value={form.category} onChange={set("category")}>
            <option value="">Select a category</option>
            {CATEGORY_NAMES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.category && <p className="field-error">{errors.category}</p>}
        </div>

        <div>
          <label htmlFor="status" className="label">Status</label>
          <select id="status" className="input" value={form.status} onChange={set("status")}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div>
          <label htmlFor="price" className="label">Price (USD)</label>
          <input id="price" type="number" min="0.01" step="0.01" inputMode="decimal" className={`input ${errors.price ? "input-error" : ""}`} value={form.price} onChange={set("price")} placeholder="45" />
          {errors.price && <p className="field-error">{errors.price}</p>}
        </div>

        <div>
          <label htmlFor="duration" className="label">Estimated duration (minutes)</label>
          <input id="duration" type="number" min="1" step="1" inputMode="numeric" className={`input ${errors.duration ? "input-error" : ""}`} value={form.duration} onChange={set("duration")} placeholder="60" />
          {errors.duration && <p className="field-error">{errors.duration}</p>}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="description" className="label">Description</label>
          <textarea id="description" rows={5} className={`input resize-y ${errors.description ? "input-error" : ""}`} value={form.description} onChange={set("description")} placeholder="Describe what's included in this service…" />
          {errors.description && <p className="field-error">{errors.description}</p>}
        </div>

        <div className="sm:col-span-2">
          <ImageInput
            label={isEdit ? "Service image (upload to replace)" : "Service image"}
            value={image}
            onChange={setImage}
            existingUrl={service?.image}
            error={errors.image}
          />
        </div>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-stone-100 pt-5 sm:flex-row sm:justify-end">
        <Link href="/dashboard/admin/services" className="btn-outline">Cancel</Link>
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? <Spinner /> : <Save className="h-4 w-4" />}
          {status === "uploading" ? "Uploading image…" : status === "saving" ? "Saving…" : isEdit ? "Update service" : "Create service"}
        </button>
      </div>
    </form>
  );
}
