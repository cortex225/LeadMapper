import { LeadStatus } from "@/types";

export const STATUS_LABEL: Record<LeadStatus, string> = {
  todo: "À contacter",
  contacted: "Contacté",
  meeting: "Rendez-vous",
  won: "Signé",
  dismissed: "Écarté",
};

export const STATUS_ORDER: LeadStatus[] = ["todo", "contacted", "meeting", "won", "dismissed"];

export interface Tracking {
  status: LeadStatus;
  notes: string;
}

const KEY = "leadmapper:tracking:v1";

/** Suivi commercial (statut, notes) conservé dans le navigateur, indexé par identifiant de lieu. */
export function loadTracking(): Record<string, Tracking> {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, Tracking>) : {};
  } catch {
    return {};
  }
}

export function saveTracking(tracking: Record<string, Tracking>) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(tracking));
  } catch {
    // Stockage indisponible (navigation privée) : le suivi reste en mémoire pour la session.
  }
}
