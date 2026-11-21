"use client";

import { useState } from "react";
import { initials } from "@/lib/format";

export default function Avatar({
  src,
  name,
  size = 36,
}: {
  src?: string | null;
  name?: string | null;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);
  const style = { width: size, height: size };

  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name || "User avatar"}
        style={style}
        className="shrink-0 rounded-full object-cover ring-2 ring-white"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <span
      style={{ ...style, fontSize: size * 0.38 }}
      className="grid shrink-0 place-items-center rounded-full bg-brand-100 font-semibold text-brand-800 ring-2 ring-white"
      aria-label={name || "User"}
    >
      {initials(name)}
    </span>
  );
}
