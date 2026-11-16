import { useEffect, useRef, useState } from "react";
import { Globe, MapPin, Phone, X } from "lucide-react";
import { Lead, LeadStatus } from "@/types";
import { domainOf, scoreBreakdown } from "@/lib/scoring";
import { STATUS_LABEL, STATUS_ORDER, Tracking } from "@/lib/pipeline";
import { PriorityBadge, Rating } from "./LeadBits";

/** N'accepte que les liens http(s) venant de Google. */
function safeUrl(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.href : undefined;
  } catch {
    return undefined;
  }
}

interface LeadDetailProps {
  lead: Lead;
  onClose: () => void;
  onTrack: (placeId: string, patch: Partial<Tracking>) => void;
}

export default function LeadDetail({ lead, onClose, onTrack }: LeadDetailProps) {
  const [notes, setNotes] = useState(lead.notes);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const b = scoreBreakdown(lead);

  useEffect(() => {
    setNotes(lead.notes);
    panelRef.current?.scrollTo({ top: 0 });
    headingRef.current?.focus({ preventScroll: true });
    // Réinitialise le brouillon uniquement quand on change de commerce.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lead.placeId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // Échap dans un champ le quitte d'abord (et enregistre la note) ; un second Échap ferme la fiche.
      const active = document.activeElement;
      if (active instanceof HTMLTextAreaElement || active instanceof HTMLSelectElement) {
        active.blur();
        return;
      }
      onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const reasons = [
    { label: "Pas de site web", points: b.noWebsite, max: 50 },
    { label: "Note Google", points: b.rating, max: 20 },
    { label: "Volume d'avis", points: b.reviews, max: 20 },
    { label: "Secteur où le web compte", points: b.sector, max: 10 },
  ];

  return (
    <>
      <div aria-hidden onClick={onClose} className="fixed inset-0 z-[999] bg-slate-900/40 lg:hidden" />
      <aside
        ref={panelRef}
        aria-labelledby="lead-detail-title"
        className="fixed inset-x-0 bottom-0 z-[1000] max-h-[75vh] overflow-y-auto rounded-t-2xl border bg-white p-5 shadow-2xl lg:absolute lg:inset-x-auto lg:bottom-auto lg:right-4 lg:top-4 lg:max-h-[calc(100%-2rem)] lg:w-[360px] lg:rounded-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="text-xs font-medium text-muted-foreground">{lead.category}</p>
            <h2
              id="lead-detail-title"
              ref={headingRef}
              tabIndex={-1}
              className="text-lg font-semibold leading-snug text-foreground outline-none">
              {lead.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la fiche"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-md text-slate-600 hover:bg-slate-100 hover:text-foreground">
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <PriorityBadge priority={lead.priority} />
          <Rating rating={lead.rating} count={lead.reviewsCount} />
        </div>

        <ul className="mt-4 space-y-2 text-sm">
          <li className="flex gap-2 text-foreground">
            <MapPin aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
            {lead.address}
          </li>
          <li className="flex gap-2">
            <Phone aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
            {lead.phone ? (
              <a
                href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`}
                className="font-medium text-primary underline-offset-2 hover:underline">
                {lead.phone}
              </a>
            ) : (
              <span className="text-muted-foreground">Téléphone non renseigné</span>
            )}
          </li>
          <li className="flex gap-2">
            <Globe aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
            {lead.website ? (
              <a
                href={safeUrl(lead.website)}
                target="_blank"
                rel="noreferrer"
                className="text-primary underline-offset-2 hover:underline">
                {domainOf(lead.website)}
              </a>
            ) : (
              <span className="font-medium text-teal-800">Aucun site web référencé</span>
            )}
          </li>
        </ul>

        <section className="mt-5" aria-labelledby="score-title">
          <div className="flex items-baseline justify-between">
            <h3 id="score-title" className="text-sm font-semibold text-foreground">
              Pourquoi ce score
            </h3>
            <p className="text-sm font-semibold tabular-nums text-foreground">{lead.score} / 100</p>
          </div>
          <ul className="mt-3 space-y-2.5">
            {reasons.map((r) => (
              <li key={r.label} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 text-xs">
                <span className="text-muted-foreground">{r.label}</span>
                <span className="tabular-nums text-foreground">
                  +{r.points}
                  <span className="text-muted-foreground"> / {r.max}</span>
                </span>
                <span className="col-span-2 h-1 overflow-hidden rounded-full bg-slate-100" aria-hidden>
                  <span
                    className="block h-full rounded-full bg-primary"
                    style={{ width: `${(r.points / r.max) * 100}%` }}
                  />
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-5 space-y-3 border-t pt-4">
          <div className="space-y-1.5">
            <label htmlFor="lead-status" className="text-sm font-semibold text-foreground">
              Suivi
            </label>
            <select
              id="lead-status"
              value={lead.status}
              onChange={(e) => onTrack(lead.placeId, { status: e.target.value as LeadStatus })}
              className="h-10 w-full rounded-lg border border-input bg-white px-3 text-sm text-foreground">
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="lead-notes" className="text-sm font-semibold text-foreground">
              Notes
            </label>
            <textarea
              id="lead-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => notes !== lead.notes && onTrack(lead.placeId, { notes })}
              rows={3}
              placeholder="Ex. : propriétaire présent le matin, rappeler mardi."
              className="w-full resize-y rounded-lg border border-input bg-white px-3 py-2 text-sm text-foreground placeholder:text-slate-500"
            />
            <p className="text-xs text-muted-foreground">Enregistré dans ce navigateur.</p>
          </div>
        </section>
      </aside>
    </>
  );
}
