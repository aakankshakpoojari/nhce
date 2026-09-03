"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Extracts a human-readable message from an unknown thrown value.
 */
export function apiErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "Something went wrong";
}

interface ApiFetchState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  reload: () => void;
  setData: (updater: T | ((prev: T | null) => T | null)) => void;
}

/**
 * Loads data from an async source (e.g. the marketplace API) on mount and
 * whenever `deps` or a `reload()` call changes. State updates always happen
 * after an await, so the effect never renders synchronously.
 */
export function useApiFetch<T>(
  loader: () => Promise<T>,
  deps: readonly unknown[] = []
): ApiFetchState<T> {
  const [data, setDataState] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const loaderRef = useRef(loader);

  const reload = useCallback(() => {
    setIsLoading(true);
    setTick((t) => t + 1);
  }, []);

  const setData = useCallback((updater: T | ((prev: T | null) => T | null)) => {
    setDataState(updater);
  }, []);

  // Keep the ref in sync without touching it during render.
  useEffect(() => {
    loaderRef.current = loader;
  });

  // The dependency array intentionally mixes caller deps with our internal tick.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await loaderRef.current();
        if (!cancelled) {
          setDataState(result);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(apiErrorMessage(e));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  return { data, isLoading, error, reload, setData };
}