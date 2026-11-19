"use client";

import { useEffect, useState } from "react";
import type { ResourceState } from "@/types/management-ui";

export function useResource<T>(load: (signal: AbortSignal) => Promise<T>) {
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<ResourceState<T>>();
  const current =
    result?.load === load && result.revision === revision ? result : undefined;

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setResult({ load, revision, data });
      },
      (error: unknown) => {
        if (!controller.signal.aborted) setResult({ load, revision, error });
      },
    );
    return () => controller.abort();
  }, [load, revision]);

  return {
    data: current?.data,
    error: current?.error,
    loading: !current,
    refresh: () => setRevision((value) => value + 1),
  };
}
