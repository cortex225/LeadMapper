import { SearchParams, SearchResult } from "@/types";
import { demoSearch } from "./demoData";

/**
 * Source des données : "demo" par défaut (aucune clé requise),
 * "google" quand VITE_DATA_SOURCE=google et que le serveur a une clé Google Places.
 */
export const DATA_SOURCE: "demo" | "google" = import.meta.env.VITE_DATA_SOURCE === "google" ? "google" : "demo";

export class SearchError extends Error {}

export async function searchPlaces(params: SearchParams, signal?: AbortSignal): Promise<SearchResult> {
  if (DATA_SOURCE === "demo") {
    // Latence simulée pour que l'état de chargement reste visible en démo.
    await new Promise((resolve) => setTimeout(resolve, 700));
    return demoSearch(params);
  }

  const query = new URLSearchParams({
    query: params.query,
    location: params.location,
    radius: String(params.radius),
  });

  let response: Response;
  try {
    response = await fetch(`/api/search?${query}`, { signal });
  } catch (error) {
    if ((error as Error).name === "AbortError") throw error;
    throw new SearchError("Le serveur ne répond pas. Vérifiez qu'il tourne (npm run server).");
  }

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new SearchError(body?.error ?? `La recherche a échoué (code ${response.status}).`);
  }
  return { ...body, source: "google" } as SearchResult;
}
