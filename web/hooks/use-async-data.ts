"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseAsyncDataResult<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  reload: () => void;
}

export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
  refreshIntervalMs = 0,
): UseAsyncDataResult<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const loadedOnce = useRef(false);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;

    if (!loadedOnce.current) setIsLoading(true);
    setIsError(false);

    fetcher()
      .then((result) => {
        if (!cancelled) {
          setData(result);
          loadedOnce.current = true;
        }
      })
      .catch(() => {
        if (!cancelled) setIsError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey, ...deps]);

  useEffect(() => {
    if (refreshIntervalMs < 1000) return;

    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") reload();
    }, refreshIntervalMs);

    return () => window.clearInterval(timer);
  }, [refreshIntervalMs, reload]);

  return { data, isLoading, isError, reload };
}
