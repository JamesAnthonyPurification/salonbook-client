import { Loader2 } from "lucide-react";

export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return <Loader2 className={`animate-spin ${className}`} aria-hidden />;
}

export function PageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-stone-500" role="status">
      <Spinner className="h-8 w-8 text-brand-600" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="card divide-y divide-stone-100 p-0" role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex animate-pulse items-center gap-4 p-4">
          <div className="h-10 w-10 rounded-lg bg-stone-200" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 rounded bg-stone-200" />
            <div className="h-3 w-1/5 rounded bg-stone-100" />
          </div>
          <div className="h-6 w-20 rounded-full bg-stone-100" />
        </div>
      ))}
    </div>
  );
}

export function StatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card h-28 animate-pulse bg-stone-50" />
      ))}
    </div>
  );
}
