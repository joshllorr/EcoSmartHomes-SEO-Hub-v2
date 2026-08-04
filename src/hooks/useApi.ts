/**
 * src/hooks/useApi.ts
 *
 * Live API Fetcher Hooks for EcoSmartHomes SEO Intelligence Dashboard
 */

import { useState, useEffect } from "react";

export async function apiGet<T = any>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`GET ${path} failed with status ${res.status}`);
  }
  return res.json();
}

export async function apiPost<T = any>(path: string, body: any): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    throw new Error(`POST ${path} failed with status ${res.status}`);
  }
  return res.json();
}

export function useApiQuery<T = any>(path: string, pollIntervalMs?: number) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const json = await apiGet<T>(path);
      setData(json);
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    if (pollIntervalMs && pollIntervalMs > 0) {
      const interval = setInterval(fetchData, pollIntervalMs);
      return () => clearInterval(interval);
    }
  }, [path, pollIntervalMs]);

  return { data, loading, error, refetch: fetchData };
}
