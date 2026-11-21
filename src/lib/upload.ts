/** Uploads an image file through our server route to ImgBB and returns the hosted URL. */
export async function uploadImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file");
  if (file.size > 5 * 1024 * 1024) throw new Error("Image must be 5 MB or smaller");

  const form = new FormData();
  form.append("image", file);

  let res: Response;
  try {
    res = await fetch("/api/upload", { method: "POST", body: form });
  } catch {
    throw new Error("Image upload failed. Check your connection and try again.");
  }
  const json = (await res.json().catch(() => ({}))) as { url?: string; message?: string };
  if (!res.ok || !json.url) throw new Error(json.message || "Image upload failed");
  return json.url;
}
