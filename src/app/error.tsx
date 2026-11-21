"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-red-50 text-red-600">
        <AlertTriangle className="h-8 w-8" />
      </span>
      <h1 className="mt-5 text-3xl font-semibold">Something went wrong</h1>
      <p className="mt-2 max-w-md text-stone-500">An unexpected error occurred. Please try again — if it keeps happening, come back in a few minutes.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button onClick={reset} className="btn-primary">Try again</button>
        <Link href="/" className="btn-outline">Go home</Link>
      </div>
    </div>
  );
}
