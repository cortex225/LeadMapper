import { FormEvent, useEffect, useState } from "react";
import { Loader2, LocateFixed, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchParams } from "@/types";

interface SearchPanelProps {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
  /** Recherche imposée de l'extérieur (exemples cliquables). */
  preset: SearchParams | null;
}

const RADII = [1, 2, 5, 10, 20];
const fieldClass =
  "h-11 w-full rounded-lg border border-input bg-white text-sm text-foreground placeholder:text-slate-500 shadow-sm transition-colors hover:border-slate-400 focus-visible:border-primary";

export default function SearchPanel({ onSearch, isLoading, preset }: SearchPanelProps) {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [radius, setRadius] = useState(5);
  const [geoState, setGeoState] = useState<{ loading: boolean; error: string | null }>({ loading: false, error: null });

  useEffect(() => {
    if (!preset) return;
    setQuery(preset.query);
    setLocation(preset.location);
    setRadius(preset.radius);
  }, [preset]);

  const canSubmit = query.trim() !== "" && location.trim() !== "" && !isLoading;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (canSubmit) onSearch({ query: query.trim(), location: location.trim(), radius });
  };

  const locate = () => {
    if (!navigator.geolocation) {
      setGeoState({ loading: false, error: "Votre navigateur ne permet pas la géolocalisation." });
      return;
    }
    setGeoState({ loading: true, error: null });
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocation(`${coords.latitude.toFixed(5)},${coords.longitude.toFixed(5)}`);
        setGeoState({ loading: false, error: null });
      },
      (err) => {
        const message =
          err.code === err.PERMISSION_DENIED
            ? "Accès à la position refusé. Saisissez une ville."
            : "Position introuvable pour le moment. Saisissez une ville.";
        setGeoState({ loading: false, error: message });
      },
      { timeout: 10000 },
    );
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-xl border bg-white p-4 shadow-sm sm:p-5"
      aria-label="Rechercher des commerces">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_140px_auto] md:items-end">
        <div className="space-y-1.5">
          <label htmlFor="query" className="text-sm font-medium text-foreground">
            Type de commerce
          </label>
          <div className="relative">
            <Search
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            />
            <input
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Barbier, restaurant, fleuriste…"
              autoComplete="off"
              maxLength={80}
              className={`${fieldClass} pl-9 pr-3`}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="location" className="text-sm font-medium text-foreground">
            Ville ou coordonnées
          </label>
          <div className="relative">
            <MapPin
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            />
            <input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Montréal"
              autoComplete="address-level2"
              maxLength={80}
              aria-describedby={geoState.error ? "geo-error" : undefined}
              className={`${fieldClass} pl-9 pr-11`}
            />
            <button
              type="button"
              onClick={locate}
              disabled={geoState.loading}
              aria-label="Utiliser ma position"
              title="Utiliser ma position"
              className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-slate-600 hover:bg-slate-100 hover:text-foreground disabled:opacity-60">
              {geoState.loading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <LocateFixed className="h-4 w-4" aria-hidden />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="radius" className="text-sm font-medium text-foreground">
            Rayon
          </label>
          <select
            id="radius"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className={`${fieldClass} px-3`}>
            {RADII.map((r) => (
              <option key={r} value={r}>
                {r} km
              </option>
            ))}
          </select>
        </div>

        <Button type="submit" disabled={!canSubmit} className="h-11 rounded-lg px-5 text-sm font-semibold">
          {isLoading ? <Loader2 className="animate-spin" aria-hidden /> : <Search aria-hidden />}
          {isLoading ? "Recherche…" : "Rechercher"}
        </Button>
      </div>
      {geoState.error && (
        <p id="geo-error" role="alert" className="mt-2 text-sm text-destructive">
          {geoState.error}
        </p>
      )}
    </form>
  );
}
