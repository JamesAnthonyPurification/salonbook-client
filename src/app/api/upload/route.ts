import { NextResponse } from "next/server";
import { createHash } from "crypto";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

type UploadResult = { url: string } | { error: string };

/** Primary host: ImgBB. The API key stays on the server and is never exposed to the browser. */
async function uploadToImgBB(base64: string): Promise<UploadResult> {
  const key = process.env.IMGBB_API_KEY;
  if (!key) return { error: "ImgBB is not configured" };
  try {
    const body = new FormData();
    body.append("image", base64);
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(key)}`, { method: "POST", body });
    const json = (await res.json().catch(() => ({}))) as {
      success?: boolean;
      data?: { url?: string; display_url?: string };
      error?: { message?: string };
    };
    const url = json?.data?.url || json?.data?.display_url;
    if (res.ok && json.success && url) return { url };
    return { error: json?.error?.message || `ImgBB responded with ${res.status}` };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "ImgBB request failed" };
  }
}

/**
 * Fallback host: Cloudinary (signed upload). Only used when ImgBB refuses the upload,
 * e.g. because ImgBB blocks requests from some regions. Optional: skipped when not configured.
 */
async function uploadToCloudinary(base64: string, mime: string): Promise<UploadResult> {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud || !apiKey || !secret) return { error: "Cloudinary fallback is not configured" };
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = "salonbook";
    const signature = createHash("sha1").update(`folder=${folder}&timestamp=${timestamp}${secret}`).digest("hex");
    const body = new FormData();
    body.append("file", `data:${mime};base64,${base64}`);
    body.append("api_key", apiKey);
    body.append("timestamp", String(timestamp));
    body.append("folder", folder);
    body.append("signature", signature);
    const res = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloud)}/image/upload`, {
      method: "POST",
      body,
    });
    const json = (await res.json().catch(() => ({}))) as { secure_url?: string; error?: { message?: string } };
    if (res.ok && json.secure_url) return { url: json.secure_url };
    return { error: json?.error?.message || `Cloudinary responded with ${res.status}` };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Cloudinary request failed" };
  }
}

/** POST /api/upload  (multipart field "image") -> { url } */
export async function POST(req: Request) {
  let file: File | null = null;
  try {
    const form = await req.formData();
    const value = form.get("image");
    file = value instanceof File ? value : null;
  } catch {
    return NextResponse.json({ message: "Invalid upload request" }, { status: 400 });
  }

  if (!file) return NextResponse.json({ message: "Please choose an image to upload" }, { status: 400 });
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ message: "Only JPG, PNG, WEBP or GIF images are allowed" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) return NextResponse.json({ message: "Image must be 5 MB or smaller" }, { status: 400 });

  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");

  const primary = await uploadToImgBB(base64);
  if ("url" in primary) return NextResponse.json({ url: primary.url, host: "imgbb" });
  console.error("ImgBB upload failed:", primary.error);

  const fallback = await uploadToCloudinary(base64, file.type);
  if ("url" in fallback) return NextResponse.json({ url: fallback.url, host: "cloudinary" });
  console.error("Cloudinary fallback failed:", fallback.error);

  return NextResponse.json(
    { message: `Image upload failed (${primary.error}). Please try another image.` },
    { status: 502 }
  );
}
