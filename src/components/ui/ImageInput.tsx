"use client";

import { useEffect, useState } from "react";
import { ImagePlus, Link2, Upload } from "lucide-react";

export type ImageValue = { mode: "upload"; file: File | null } | { mode: "url"; url: string };

interface ImageInputProps {
  value: ImageValue;
  onChange: (v: ImageValue) => void;
  /** Allow pasting an image URL in addition to uploading (profile images) */
  allowUrl?: boolean;
  existingUrl?: string | null;
  error?: string;
  label?: string;
}

export default function ImageInput({ value, onChange, allowUrl = false, existingUrl, error, label = "Image" }: ImageInputProps) {
  const [preview, setPreview] = useState<string | null>(existingUrl ?? null);

  useEffect(() => {
    if (value.mode === "upload" && value.file) {
      const url = URL.createObjectURL(value.file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    if (value.mode === "url") setPreview(value.url || existingUrl || null);
    else setPreview(existingUrl ?? null);
  }, [value, existingUrl]);

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="label mb-0">{label}</span>
        {allowUrl && (
          <div className="inline-flex rounded-full bg-stone-100 p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => onChange({ mode: "upload", file: null })}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${value.mode === "upload" ? "bg-white shadow-sm" : "text-stone-500"}`}
            >
              <Upload className="h-3 w-3" /> Upload
            </button>
            <button
              type="button"
              onClick={() => onChange({ mode: "url", url: "" })}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 ${value.mode === "url" ? "bg-white shadow-sm" : "text-stone-500"}`}
            >
              <Link2 className="h-3 w-3" /> URL
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-dashed border-stone-300 bg-stone-50">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Preview" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <ImagePlus className="h-6 w-6 text-stone-400" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          {value.mode === "upload" ? (
            <>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={(e) => onChange({ mode: "upload", file: e.target.files?.[0] ?? null })}
                className="block w-full text-sm text-stone-600 file:mr-3 file:rounded-full file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-100"
              />
              <p className="mt-1 text-xs text-stone-400">JPG, PNG, WEBP or GIF · up to 5 MB</p>
            </>
          ) : (
            <input
              type="url"
              placeholder="https://example.com/photo.jpg"
              value={value.url}
              onChange={(e) => onChange({ mode: "url", url: e.target.value })}
              className={`input ${error ? "input-error" : ""}`}
            />
          )}
        </div>
      </div>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
