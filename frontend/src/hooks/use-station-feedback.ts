"use client";

import { useCallback, useState } from "react";
import { useResource } from "@/hooks/use-resource";
import type { StationFeedbackLoader } from "@/types/management-ui";

export function useStationFeedback<T>(
  stationId: string,
  fetchPage: StationFeedbackLoader<T>,
) {
  const [page, setPage] = useState(0);
  const load = useCallback(
    (signal: AbortSignal) => fetchPage(stationId, page, signal),
    [fetchPage, page, stationId],
  );
  const resource = useResource(load);

  return {
    ...resource,
    setPage,
    reloadFirstPage() {
      setPage(0);
      resource.refresh();
    },
  };
}
