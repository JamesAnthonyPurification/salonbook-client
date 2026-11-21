"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X, SearchX, RefreshCw } from "lucide-react";
import ServiceCard, { ServiceCardSkeleton } from "./ServiceCard";
import EmptyState from "@/components/ui/EmptyState";
import { getErrorMessage, publicApi } from "@/lib/api";
import { CATEGORY_NAMES } from "@/lib/constants";
import type { Service } from "@/lib/types";

export default function ServiceBrowser() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const category = params.get("category") ?? "";
  const sort = params.get("sort") ?? "";
  const search = params.get("search") ?? "";

  const [query, setQuery] = useState(search);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`${pathname}${next.toString() ? `?${next}` : ""}`, { scroll: false });
  }

  // Debounce search input -> URL
  useEffect(() => {
    const t = setTimeout(() => {
      if (query.trim() !== search) updateParam("search", query.trim());
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    publicApi
      .get<{ data: Service[] }>("/services", { params: { search, category, sort } })
      .then((res) => !cancelled && setServices(res.data.data))
      .catch((err) => !cancelled && setError(getErrorMessage(err, "Could not load services")))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [search, category, sort, reloadKey]);

  const hasFilters = Boolean(search || category || sort);

  return (
    <div>
      {/* Toolbar */}
      <div className="card flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services by name…"
            className="input pl-10"
            aria-label="Search services by name"
          />
        </div>
        <div className="grid grid-cols-2 gap-3 lg:flex">
          <select
            value={category}
            onChange={(e) => updateParam("category", e.target.value)}
            className="input lg:w-56"
            aria-label="Filter by category"
          >
            <option value="">All categories</option>
            {CATEGORY_NAMES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select value={sort} onChange={(e) => updateParam("sort", e.target.value)} className="input lg:w-48" aria-label="Sort by price">
            <option value="">Newest first</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Category chips */}
      <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {["", ...CATEGORY_NAMES].map((c) => (
          <button
            key={c || "all"}
            onClick={() => updateParam("category", c)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              category === c ? "bg-brand-700 text-white" : "bg-white text-stone-600 ring-1 ring-stone-200 hover:ring-brand-300"
            }`}
          >
            {c || "All"}
          </button>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between text-sm text-stone-500">
        <p className="inline-flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          {loading ? "Loading services…" : `${services.length} service${services.length === 1 ? "" : "s"} found`}
        </p>
        {hasFilters && (
          <button
            onClick={() => {
              setQuery("");
              router.replace(pathname, { scroll: false });
            }}
            className="inline-flex items-center gap-1 font-medium text-brand-700 hover:underline"
          >
            <X className="h-4 w-4" /> Clear filters
          </button>
        )}
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <ServiceCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <EmptyState
            title="Couldn't load services"
            description={error}
            action={
              <button className="btn-primary" onClick={() => setReloadKey((k) => k + 1)}>
                <RefreshCw className="h-4 w-4" /> Try again
              </button>
            }
          />
        ) : services.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No services match your search"
            description="Try a different name or category, or clear the filters."
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <ServiceCard key={s._id} service={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
