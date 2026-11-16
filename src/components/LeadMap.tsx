import { useEffect } from "react";
import { CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from "react-leaflet";
import { latLngBounds } from "leaflet";
import "leaflet/dist/leaflet.css";
import { Lead } from "@/types";
import { PRIORITY_COLOR, PRIORITY_LABEL } from "@/lib/scoring";
import { Priority } from "@/types";

interface LeadMapProps {
  leads: Lead[];
  center: { lat: number; lng: number };
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/**
 * Cadre la carte sur les résultats. Recadre aussi quand la carte passe de masquée à visible
 * (onglet Carte sur mobile), car Leaflet ne connaît pas sa taille tant qu'elle est masquée.
 */
function FitToLeads({ leads, center }: { leads: Lead[]; center: { lat: number; lng: number } }) {
  const map = useMap();
  const resultKey = leads.map((l) => l.placeId).join("|");

  useEffect(() => {
    const fit = () => {
      if (leads.length === 0) map.setView([center.lat, center.lng], 13);
      else map.fitBounds(latLngBounds(leads.map((l) => [l.lat, l.lng])), { padding: [40, 40], maxZoom: 15 });
    };
    fit();

    let wasHidden = map.getContainer().clientWidth === 0;
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
      const hidden = map.getContainer().clientWidth === 0;
      if (wasHidden && !hidden) fit();
      wasHidden = hidden;
    });
    observer.observe(map.getContainer());
    return () => observer.disconnect();
    // On ne recadre qu'au changement de résultats, pas à chaque changement de statut.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, center.lat, center.lng, resultKey]);
  return null;
}

function FollowSelection({ lead }: { lead: Lead | undefined }) {
  const map = useMap();
  useEffect(() => {
    if (!lead) return;
    // Sur grand écran, la fiche couvre le côté droit : on décale le marqueur vers la gauche.
    const shift = window.matchMedia("(min-width: 1024px)").matches ? 190 : 0;
    const target = map.unproject(map.project([lead.lat, lead.lng]).add([shift, 0]));
    map.panTo(target, { animate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, lead?.placeId]);
  return null;
}

export default function LeadMap({ leads, center, selectedId, onSelect }: LeadMapProps) {
  const selected = leads.find((l) => l.placeId === selectedId);
  // Le marqueur sélectionné est dessiné en dernier pour rester au-dessus des autres.
  const ordered = selected ? [...leads.filter((l) => l !== selected), selected] : leads;

  return (
    <div
      role="region"
      aria-label="Carte des commerces"
      className="relative h-full w-full overflow-hidden rounded-xl border bg-slate-100">
      <MapContainer center={[center.lat, center.lng]} zoom={13} scrollWheelZoom className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitToLeads leads={leads} center={center} />
        <FollowSelection lead={selected} />
        {ordered.map((lead) => {
          const isSelected = lead.placeId === selectedId;
          return (
            <CircleMarker
              key={lead.placeId}
              center={[lead.lat, lead.lng]}
              radius={isSelected ? 11 : 7}
              pathOptions={{
                color: isSelected ? "#0b1220" : "#ffffff",
                weight: isSelected ? 3 : 2,
                fillColor: PRIORITY_COLOR[lead.priority],
                fillOpacity: lead.status === "dismissed" ? 0.35 : 0.95,
              }}
              eventHandlers={{ click: () => onSelect(lead.placeId) }}>
              <Tooltip direction="top" offset={[0, -8]}>
                <span className="font-medium">{lead.name}</span> · score {lead.score}
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
      <div className="pointer-events-none absolute bottom-3 left-3 z-[500] rounded-lg border bg-white/95 px-3 py-2 text-xs shadow-sm">
        <p className="font-medium text-foreground">Priorité</p>
        <ul className="mt-1 flex gap-3">
          {(["high", "medium", "low"] as Priority[]).map((p) => (
            <li key={p} className="flex items-center gap-1.5 text-muted-foreground">
              <span
                aria-hidden
                className="h-2.5 w-2.5 rounded-full ring-2 ring-white"
                style={{ background: PRIORITY_COLOR[p] }}
              />
              {PRIORITY_LABEL[p]}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
