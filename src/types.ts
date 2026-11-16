export type Priority = "high" | "medium" | "low";

export type LeadStatus = "todo" | "contacted" | "meeting" | "won" | "dismissed";

/** Commerce tel que renvoyé par la source de données (Google Places ou démo). */
export interface Place {
  placeId: string;
  name: string;
  category: string;
  types: string[];
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviewsCount?: number;
  lat: number;
  lng: number;
}

/** Commerce enrichi du score et du suivi commercial. */
export interface Lead extends Place {
  score: number;
  priority: Priority;
  status: LeadStatus;
  notes: string;
}

export interface SearchParams {
  query: string;
  location: string;
  radius: number;
}

export interface SearchResult {
  places: Place[];
  center: { lat: number; lng: number };
  source: "demo" | "google";
}
