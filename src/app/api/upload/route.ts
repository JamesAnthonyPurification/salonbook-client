import { NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * Uploads an image to ImgBB. The API key stays on the server and is never
 * exposed to the browser.
 */
export async function POST(req: Request) {
  const key = process.env.IMGBB_API_KEY;
  if (!key) return NextResponse.json({ message: "Image upload is not configured" }, { status: 500 });

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

  try {
    const body = new FormData();
    body.append("image", Buffer.from(await file.arrayBuffer()).toString("base64"));
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(key)}`, {
      method: "POST",
      body,
    });
    const json = (await res.json().catch(() => ({}))) as {
      success?: boolean;
      data?: { url?: string; display_url?: string };
      error?: { message?: string; code?: number };
    };
    const url = json?.data?.url || json?.data?.display_url;
    if (!res.ok || !json.success || !url) {
      console.error("ImgBB upload failed:", res.status, JSON.stringify(json?.error ?? json));
      const reason = json?.error?.message ? ` (${json.error.message})` : "";
      return NextResponse.json({ message: `Image upload failed${reason}. Please try another image.` }, { status: 502 });
    }
    return NextResponse.json({ url });
  } catch (err) {
    console.error("ImgBB upload error:", err);
    return NextResponse.json({ message: "Image upload failed. Please try again." }, { status: 502 });
  }
}
