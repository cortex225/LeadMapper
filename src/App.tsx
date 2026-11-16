import { useCallback, useMemo, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { List, Map as MapIcon } from "lucide-react";
import AppHeader from "./components/AppHeader";
import SearchPanel from "./components/SearchPanel";
import StatsRow from "./components/StatsRow";
import LeadList, { ListFilters } from "./components/LeadList";
import LeadMap from "./components/LeadMap";
import LeadDetail from "./components/LeadDetail";
import { EmptyState, ErrorState, LoadingState, WelcomeState } from "./components/States";
import { useLeadSearch } from "./hooks/useLeadSearch";
import { downloadCsv } from "./lib/csv";
import { cn } from "./lib/utils";
import { Lead, SearchParams } from "./types";

const DEFAULT_FILTERS: ListFilters = { priority: "all", noWebsiteOnly: false, sort: "score" };

function sortLeads(leads: Lead[], sort: ListFilters["sort"]) {
  const copy = [...leads];
  switch (sort) {
    case "rating":
      return copy.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    case "reviews":
      return copy.sort((a, b) => (b.reviewsCount ?? 0) - (a.reviewsCount ?? 0));
    case "name":
      return copy.sort((a, b) => a.name.localeCompare(b.name, "fr"));
    default:
      return copy.sort((a, b) => b.score - a.score);
  }
}

export default function App() {
  const { status, leads, center, error, params, search, retry, updateTracking } = useLeadSearch();
  const [filters, setFilters] = useState<ListFilters>(DEFAULT_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [preset, setPreset] = useState<SearchParams | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  const runSearch = useCallback(
    (next: SearchParams) => {
      setSelectedId(null);
      setFilters((f) => ({ ...DEFAULT_FILTERS, sort: f.sort }));
      search(next);
    },
    [search],
  );

  const runExample = (next: SearchParams) => {
    setPreset(next);
    runSearch(next);
  };

  const visibleLeads = useMemo(() => {
    const filtered = leads.filter(
      (l) => (filters.priority === "all" || l.priority === filters.priority) && (!filters.noWebsiteOnly || !l.website),
    );
    return sortLeads(filtered, filters.sort);
  }, [leads, filters]);

  const selectedLead = leads.find((l) => l.placeId === selectedId);
  const closeDetail = useCallback(() => setSelectedId(null), []);

  const exportCsv = () => {
    const name = params ? `${params.query}-${params.location}` : "export";
    downloadCsv(visibleLeads, `leadmapper-${name.toLowerCase().replace(/[^a-z0-9]+/gi, "-")}.csv`);
    toast.success(`${visibleLeads.length} commerces exportés`);
  };

  return (
    <div className="min-h-screen">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[2000] focus:rounded-md focus:bg-white focus:px-3 focus:py-2">
        Aller au contenu
      </a>
      <Toaster position="bottom-center" toastOptions={{ style: { fontSize: 14, borderRadius: 10 } }} />
      <AppHeader />

      <main id="contenu" className="mx-auto max-w-[1400px] space-y-5 px-4 py-6 sm:px-6">
        {status !== "idle" && <h1 className="sr-only">Prospection de commerces sans site web</h1>}
        <SearchPanel onSearch={runSearch} isLoading={status === "loading"} preset={preset} />

        {status === "idle" && <WelcomeState onExample={runExample} />}
        {status === "loading" && <LoadingState />}
        {status === "error" && <ErrorState message={error ?? "Erreur inconnue."} onRetry={retry} />}
        {status === "success" && leads.length === 0 && <EmptyState params={params} />}

        {status === "success" && leads.length > 0 && center && (
          <>
            <StatsRow leads={leads} />

            <div role="group" aria-label="Affichage" className="flex rounded-lg bg-slate-200/70 p-0.5 lg:hidden">
              {(["list", "map"] as const).map((view) => (
                <button
                  key={view}
                  type="button"
                  aria-pressed={mobileView === view}
                  onClick={() => setMobileView(view)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-md py-2 text-sm font-medium",
                    mobileView === view ? "bg-white text-foreground shadow-sm" : "text-slate-600",
                  )}>
                  {view === "list" ? (
                    <List className="h-4 w-4" aria-hidden />
                  ) : (
                    <MapIcon className="h-4 w-4" aria-hidden />
                  )}
                  {view === "list" ? "Liste" : "Carte"}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:h-[max(540px,calc(100vh-340px))] lg:grid-cols-[420px_minmax(0,1fr)]">
              <div className={cn("min-h-0 min-w-0 lg:flex lg:flex-col", mobileView === "map" && "hidden")}>
                <LeadList
                  leads={visibleLeads}
                  totalCount={leads.length}
                  filters={filters}
                  onFiltersChange={setFilters}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                  onExport={exportCsv}
                />
              </div>
              <div className="min-w-0 lg:relative lg:min-h-0">
                <div className={cn("h-[65vh] lg:block lg:h-full", mobileView === "list" && "hidden")}>
                  <LeadMap leads={visibleLeads} center={center} selectedId={selectedId} onSelect={setSelectedId} />
                </div>
                {selectedLead && <LeadDetail lead={selectedLead} onClose={closeDetail} onTrack={updateTracking} />}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
