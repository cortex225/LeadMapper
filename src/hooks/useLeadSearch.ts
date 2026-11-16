import { useCallback, useMemo, useRef, useState } from "react";
import { Lead, Place, SearchParams } from "@/types";
import { searchPlaces } from "@/services/leadsApi";
import { priorityFromScore, scorePlace } from "@/lib/scoring";
import { loadTracking, saveTracking, Tracking } from "@/lib/pipeline";

type Status = "idle" | "loading" | "success" | "error";

const EMPTY_TRACKING: Tracking = { status: "todo", notes: "" };

export function useLeadSearch() {
  const [status, setStatus] = useState<Status>("idle");
  const [places, setPlaces] = useState<Place[]>([]);
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<SearchParams | null>(null);
  const [tracking, setTracking] = useState<Record<string, Tracking>>(loadTracking);
  const controller = useRef<AbortController | null>(null);

  const search = useCallback(async (next: SearchParams) => {
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;

    setParams(next);
    setStatus("loading");
    setError(null);
    try {
      const result = await searchPlaces(next, current.signal);
      if (current.signal.aborted) return;
      setPlaces(result.places);
      setCenter(result.center);
      setStatus("success");
    } catch (err) {
      if (current.signal.aborted || (err as Error).name === "AbortError") return;
      setError((err as Error).message || "La recherche a échoué.");
      setStatus("error");
    }
  }, []);

  const retry = useCallback(() => {
    if (params) search(params);
  }, [params, search]);

  const updateTracking = useCallback((placeId: string, patch: Partial<Tracking>) => {
    setTracking((prev) => {
      const next = {
        ...prev,
        [placeId]: { ...EMPTY_TRACKING, ...prev[placeId], ...patch },
      };
      saveTracking(next);
      return next;
    });
  }, []);

  const leads: Lead[] = useMemo(
    () =>
      places.map((place) => {
        const score = scorePlace(place);
        return {
          ...place,
          score,
          priority: priorityFromScore(score),
          status: tracking[place.placeId]?.status ?? "todo",
          notes: tracking[place.placeId]?.notes ?? "",
        };
      }),
    [places, tracking],
  );

  return { status, leads, center, error, params, search, retry, updateTracking };
}
