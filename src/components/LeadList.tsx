import { Globe, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Lead, Priority } from "@/types";
import { STATUS_LABEL } from "@/lib/pipeline";
import { PRIORITY_COLOR, PRIORITY_LABEL, domainOf } from "@/lib/scoring";
import { Button } from "@/components/ui/button";
import { Rating, ScoreMeter } from "./LeadBits";

export type SortKey = "score" | "rating" | "reviews" | "name";

export interface ListFilters {
  priority: Priority | "all";
  noWebsiteOnly: boolean;
  sort: SortKey;
}

interface LeadListProps {
  leads: Lead[];
  totalCount: number;
  filters: ListFilters;
  onFiltersChange: (filters: ListFilters) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onExport: () => void;
}

const PRIORITY_OPTIONS: (Priority | "all")[] = ["all", "high", "medium", "low"];

export default function LeadList({
  leads,
  totalCount,
  filters,
  onFiltersChange,
  selectedId,
  onSelect,
  onExport,
}: LeadListProps) {
  const set = (patch: Partial<ListFilters>) => onFiltersChange({ ...filters, ...patch });

  return (
    <section aria-labelledby="leads-heading" className="flex min-h-0 flex-col rounded-xl border bg-white shadow-sm">
      <div className="space-y-3 border-b p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 id="leads-heading" className="text-sm font-semibold text-foreground">
            {leads.length} commerce{leads.length > 1 ? "s" : ""}
            {leads.length !== totalCount && (
              <span className="font-normal text-muted-foreground"> sur {totalCount}</span>
            )}
          </h2>
          <Button variant="outline" size="sm" onClick={onExport} disabled={leads.length === 0}>
            <Download aria-hidden />
            Exporter CSV
          </Button>
        </div>

        <div role="group" aria-label="Filtrer par priorité" className="flex rounded-lg bg-slate-100 p-0.5">
          {PRIORITY_OPTIONS.map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={filters.priority === p}
              onClick={() => set({ priority: p })}
              className={cn(
                "flex-1 rounded-md px-2 py-2 text-xs font-medium transition-colors sm:py-1.5",
                filters.priority === p
                  ? "bg-white text-foreground shadow-sm"
                  : "text-slate-600 hover:bg-white/60 hover:text-foreground",
              )}>
              {p === "all" ? "Toutes" : PRIORITY_LABEL[p]}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 text-sm">
          <label className="inline-flex cursor-pointer items-center gap-2 text-foreground">
            <input
              type="checkbox"
              checked={filters.noWebsiteOnly}
              onChange={(e) => set({ noWebsiteOnly: e.target.checked })}
              className="h-4 w-4 rounded border-input accent-[#0f766e]"
            />
            Sans site web
          </label>
          <label className="inline-flex items-center gap-2 text-muted-foreground">
            Trier par
            <select
              value={filters.sort}
              onChange={(e) => set({ sort: e.target.value as SortKey })}
              className="h-8 rounded-md border border-input bg-white px-2 text-sm text-foreground">
              <option value="score">Score</option>
              <option value="rating">Note</option>
              <option value="reviews">Nombre d'avis</option>
              <option value="name">Nom</option>
            </select>
          </label>
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-sm font-medium text-foreground">Aucun commerce ne correspond à ces filtres.</p>
          <Button
            variant="link"
            className="mt-1"
            onClick={() => onFiltersChange({ priority: "all", noWebsiteOnly: false, sort: filters.sort })}>
            Réinitialiser les filtres
          </Button>
        </div>
      ) : (
        <ul className="min-h-0 flex-1 divide-y overflow-y-auto">
          {leads.map((lead) => {
            const selected = lead.placeId === selectedId;
            return (
              <li key={lead.placeId}>
                <button
                  type="button"
                  onClick={() => onSelect(lead.placeId)}
                  aria-current={selected ? "true" : undefined}
                  className={cn(
                    "relative flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50",
                    selected && "bg-accent hover:bg-accent",
                  )}>
                  <span
                    aria-hidden
                    className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: PRIORITY_COLOR[lead.priority] }}
                  />
                  <span className="min-w-0 flex-1 space-y-1">
                    <span className="block truncate text-sm font-semibold text-foreground">{lead.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">{lead.address}</span>
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                      <Rating rating={lead.rating} count={lead.reviewsCount} />
                      {lead.website ? (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <Globe aria-hidden className="h-3 w-3" />
                          {domainOf(lead.website)}
                        </span>
                      ) : (
                        <span className="font-medium text-teal-800">Pas de site web</span>
                      )}
                      {lead.status !== "todo" && (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-700">
                          {STATUS_LABEL[lead.status]}
                        </span>
                      )}
                    </span>
                  </span>
                  <ScoreMeter score={lead.score} priority={lead.priority} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
