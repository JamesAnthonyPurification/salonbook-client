"use client";

import { useCallback, useEffect, useState } from "react";
import { api, getErrorMessage } from "@/lib/api";

/** Minimal data-fetching hook for authenticated endpoints. */
export function useApiQuery<T>(url: string | null, params?: Record<string, string | undefined>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(Boolean(url));
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const paramsKey = JSON.stringify(params ?? {});

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .get<{ data: T }>(url, { params: JSON.parse(paramsKey) })
      .then((res) => !cancelled && setData(res.data.data))
      .catch((err) => !cancelled && setError(getErrorMessage(err, "Failed to load data")))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [url, paramsKey, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, setData, loading, error, reload };
}
