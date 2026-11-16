import { Lead } from "@/types";
import { PRIORITY_LABEL } from "./scoring";
import { STATUS_LABEL } from "./pipeline";

const COLUMNS: [string, (lead: Lead) => string | number | undefined][] = [
  ["Nom", (l) => l.name],
  ["Catégorie", (l) => l.category],
  ["Adresse", (l) => l.address],
  ["Téléphone", (l) => l.phone],
  ["Site web", (l) => l.website],
  ["Note", (l) => l.rating],
  ["Avis", (l) => l.reviewsCount],
  ["Score", (l) => l.score],
  ["Priorité", (l) => PRIORITY_LABEL[l.priority]],
  ["Statut", (l) => STATUS_LABEL[l.status]],
  ["Notes", (l) => l.notes],
];

function cell(value: string | number | undefined) {
  if (value === undefined || value === "") return "";
  let text = String(value);
  // Neutralise les formules (=, +, -, @) qu'Excel exécuterait à l'ouverture.
  if (typeof value === "string" && /^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",;\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function leadsToCsv(leads: Lead[]) {
  const header = COLUMNS.map(([label]) => label).join(",");
  const rows = leads.map((lead) => COLUMNS.map(([, get]) => cell(get(lead))).join(","));
  return [header, ...rows].join("\n");
}

export function downloadCsv(leads: Lead[], filename: string) {
  // BOM pour qu'Excel lise correctement les accents.
  const blob = new Blob(["﻿" + leadsToCsv(leads)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
