import { AlertTriangle, ArrowRight, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchParams } from "@/types";
import { DEMO_EXAMPLES } from "@/services/demoData";

const SAMPLE = [
  { label: "Pas de site web", points: 50, max: 50 },
  { label: "Note Google 4,2", points: 15, max: 20 },
  { label: "212 avis", points: 20, max: 20 },
  { label: "Secteur où le web compte", points: 10, max: 10 },
];

export function WelcomeState({ onExample }: { onExample: (params: SearchParams) => void }) {
  return (
    <section
      aria-labelledby="welcome-title"
      className="grid gap-10 rounded-xl border bg-white px-6 py-10 shadow-sm sm:px-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-center">
      <div className="max-w-xl">
        <h1
          id="welcome-title"
          className="text-2xl font-semibold tracking-tight text-foreground sm:text-[32px] sm:leading-tight">
          Trouvez les commerces du quartier qui n'ont pas encore de site web.
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Indiquez un secteur et une ville. LeadMapper récupère les fiches Google Maps, signale celles qui n'ont pas de
          site et note chaque commerce sur 100 selon son besoin et sa solidité. Vous savez qui appeler en premier.
        </p>

        <ol className="mt-6 space-y-2 text-sm text-foreground">
          <li className="flex gap-3">
            <span className="w-5 shrink-0 font-semibold tabular-nums text-primary">1</span>Cherchez un secteur dans une
            ville.
          </li>
          <li className="flex gap-3">
            <span className="w-5 shrink-0 font-semibold tabular-nums text-primary">2</span>Ouvrez les fiches les mieux
            notées.
          </li>
          <li className="flex gap-3">
            <span className="w-5 shrink-0 font-semibold tabular-nums text-primary">3</span>Suivez vos appels, exportez
            en CSV.
          </li>
        </ol>

        <div className="mt-8">
          <p className="text-sm font-medium text-foreground">Essayer avec un exemple</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {DEMO_EXAMPLES.map((ex) => (
              <button
                key={ex.query + ex.location}
                type="button"
                onClick={() => onExample({ ...ex, radius: 5 })}
                className="group inline-flex min-h-10 items-center gap-1.5 rounded-full border bg-white px-3.5 text-sm text-foreground transition-colors hover:border-primary hover:text-primary">
                {ex.query} à {ex.location}
                <ArrowRight aria-hidden className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <figure aria-label="Exemple de fiche notée" className="rounded-xl border bg-slate-50 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Fleuriste · Rosemont</p>
            <p className="mt-0.5 text-base font-semibold text-foreground">Les Jardins d'Hélène</p>
          </div>
          <p className="text-2xl font-semibold tabular-nums text-foreground">
            95<span className="text-sm font-normal text-muted-foreground"> / 100</span>
          </p>
        </div>
        <ul className="mt-4 space-y-2.5">
          {SAMPLE.map((r) => (
            <li key={r.label} className="text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{r.label}</span>
                <span className="tabular-nums text-foreground">+{r.points}</span>
              </div>
              <div className="mt-1 h-1 rounded-full bg-slate-200" aria-hidden>
                <div className="h-full rounded-full bg-primary" style={{ width: `${(r.points / r.max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
        <figcaption className="mt-4 border-t pt-3 text-xs text-muted-foreground">
          Chaque commerce reçoit ce détail : vous savez pourquoi il remonte en tête.
        </figcaption>
      </figure>
    </section>
  );
}

export function LoadingState() {
  return (
    <div aria-busy="true" className="space-y-4">
      <p className="sr-only" role="status">
        Recherche en cours…
      </p>
      <div className="h-[66px] animate-pulse rounded-xl border bg-white" />
      <div className="grid gap-4 lg:grid-cols-[420px_1fr]">
        <div className="space-y-3 rounded-xl border bg-white p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2 py-1">
              <div className="h-3.5 w-2/3 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-5/6 animate-pulse rounded bg-slate-100" />
            </div>
          ))}
        </div>
        <div className="hidden h-[560px] animate-pulse rounded-xl border bg-slate-100 lg:block" />
      </div>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <section role="alert" className="rounded-xl border border-red-200 bg-white px-6 py-10 text-center shadow-sm">
      <AlertTriangle aria-hidden className="mx-auto h-8 w-8 text-destructive" />
      <h2 className="mt-3 text-base font-semibold text-foreground">La recherche n'a pas abouti</h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{message}</p>
      <Button className="mt-5" onClick={onRetry}>
        Réessayer
      </Button>
    </section>
  );
}

export function EmptyState({ params }: { params: SearchParams | null }) {
  return (
    <section className="rounded-xl border bg-white px-6 py-10 text-center shadow-sm">
      <SearchX aria-hidden className="mx-auto h-8 w-8 text-slate-400" />
      <h2 className="mt-3 text-base font-semibold text-foreground">
        Aucun résultat{params ? ` pour « ${params.query} » à ${params.location}` : ""}
      </h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
        Élargissez le rayon ou essayez un terme plus courant (« coiffeur » plutôt que « salon de coiffure unisexe »).
      </p>
    </section>
  );
}
