import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Priority } from "@/types";
import { PRIORITY_COLOR, PRIORITY_LABEL } from "@/lib/scoring";

const PRIORITY_STYLE: Record<Priority, string> = {
  high: "bg-teal-50 text-teal-800 ring-teal-600/25",
  medium: "bg-orange-50 text-orange-800 ring-orange-600/25",
  low: "bg-slate-100 text-slate-700 ring-slate-500/20",
};

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        PRIORITY_STYLE[priority],
        className,
      )}>
      <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: PRIORITY_COLOR[priority] }} />
      Priorité {PRIORITY_LABEL[priority].toLowerCase()}
    </span>
  );
}

export function ScoreMeter({ score, priority }: { score: number; priority: Priority }) {
  return (
    <div className="flex w-16 flex-col items-end gap-1" aria-label={`Score ${score} sur 100`}>
      <span className="text-sm font-semibold tabular-nums text-foreground">{score}</span>
      <div className="h-1 w-full overflow-hidden rounded-full bg-slate-200" aria-hidden>
        <div className="h-full rounded-full" style={{ width: `${score}%`, background: PRIORITY_COLOR[priority] }} />
      </div>
    </div>
  );
}

export function Rating({ rating, count }: { rating?: number; count?: number }) {
  if (rating === undefined) return <span className="text-muted-foreground">Pas encore d'avis</span>;
  return (
    <span className="inline-flex items-center gap-1">
      <Star aria-hidden className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      <span className="font-medium text-foreground tabular-nums">
        {rating.toLocaleString("fr-CA", { minimumFractionDigits: 1 })}
      </span>
      <span className="text-muted-foreground tabular-nums">({count ?? 0} avis)</span>
    </span>
  );
}
