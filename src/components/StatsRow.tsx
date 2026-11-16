import { ChevronRight } from "lucide-react";
import { Lead } from "@/types";

/** Entonnoir de prospection : de tout ce que la recherche a trouvé jusqu'aux contrats signés. */
export default function StatsRow({ leads }: { leads: Lead[] }) {
  const total = leads.length;
  const noWebsite = leads.filter((l) => !l.website).length;
  const high = leads.filter((l) => l.priority === "high").length;
  const engaged = leads.filter((l) => l.status === "contacted" || l.status === "meeting").length;
  const won = leads.filter((l) => l.status === "won").length;
  const share = total ? Math.round((noWebsite / total) * 100) : 0;

  const steps = [
    { label: "Trouvés", value: total, hint: "dans le rayon" },
    { label: "Sans site web", value: noWebsite, hint: `${share} % du total` },
    { label: "Priorité haute", value: high, hint: "score ≥ 70" },
    { label: "En discussion", value: engaged, hint: "contactés, rendez-vous" },
    { label: "Signés", value: won, hint: "contrats conclus" },
  ];

  return (
    <section aria-label="Entonnoir de prospection" className="rounded-xl border bg-white shadow-sm">
      <ol className="grid grid-cols-2 sm:grid-cols-5">
        {steps.map((step, i) => (
          <li
            key={step.label}
            className="relative border-b px-4 py-3 odd:border-r last:col-span-2 last:border-b-0 last:border-r-0 sm:border-b-0 sm:border-r sm:last:col-span-1">
            <p className="text-xs font-medium text-muted-foreground">{step.label}</p>
            <p className="mt-0.5 flex items-baseline gap-2">
              <span className="text-xl font-semibold tabular-nums tracking-tight text-foreground">{step.value}</span>
              <span className="text-xs text-muted-foreground">{step.hint}</span>
            </p>
            {i < steps.length - 1 && (
              <ChevronRight
                aria-hidden
                className="absolute -right-2.5 top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 rounded-full border bg-white p-0.5 text-slate-500 sm:block"
              />
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
