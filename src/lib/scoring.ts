import { Place, Priority } from "@/types";

/** Types de commerce pour lesquels un site web rapporte le plus (réservation, menu, prise de rendez-vous). */
const WEB_DEPENDENT_TYPES = new Set([
  "restaurant",
  "cafe",
  "bar",
  "bakery",
  "lodging",
  "store",
  "florist",
  "beauty_salon",
  "hair_care",
  "spa",
  "gym",
  "dentist",
  "physiotherapist",
  "real_estate_agency",
  "lawyer",
  "car_repair",
  "plumber",
]);

export interface ScoreBreakdown {
  noWebsite: number;
  rating: number;
  reviews: number;
  sector: number;
}

/**
 * Score de 0 à 100 : à quel point ce commerce a besoin d'un site et peut se le payer.
 * Pas de site = besoin. Bonne note et beaucoup d'avis = commerce établi, donc solvable.
 */
export function scoreBreakdown(place: Place): ScoreBreakdown {
  const noWebsite = place.website ? 0 : 50;

  let rating = 0;
  if (place.rating === undefined) rating = 5;
  else if (place.rating >= 4.5) rating = 20;
  else if (place.rating >= 4.0) rating = 15;
  else if (place.rating >= 3.5) rating = 10;
  else if (place.rating >= 3.0) rating = 5;

  const count = place.reviewsCount ?? 0;
  let reviews = 0;
  if (count >= 100) reviews = 20;
  else if (count >= 50) reviews = 15;
  else if (count >= 20) reviews = 10;
  else if (count >= 5) reviews = 5;

  const sector = place.types.some((t) => WEB_DEPENDENT_TYPES.has(t)) ? 10 : 0;

  return { noWebsite, rating, reviews, sector };
}

export function scorePlace(place: Place): number {
  const b = scoreBreakdown(place);
  return Math.min(100, b.noWebsite + b.rating + b.reviews + b.sector);
}

export function priorityFromScore(score: number): Priority {
  if (score >= 70) return "high";
  if (score >= 45) return "medium";
  return "low";
}

export const PRIORITY_LABEL: Record<Priority, string> = {
  high: "Haute",
  medium: "Moyenne",
  low: "Basse",
};

/** Couleurs des marqueurs et pastilles, contrastées sur fond clair. */
export const PRIORITY_COLOR: Record<Priority, string> = {
  high: "#0f766e",
  medium: "#c2410c",
  low: "#8a94a6",
};

export function domainOf(url: string) {
  return url
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");
}
