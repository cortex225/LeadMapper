import { MapPinned } from "lucide-react";
import { DATA_SOURCE } from "@/services/leadsApi";

export default function AppHeader() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6">
        <a href="/" className="flex items-center gap-2 rounded-md text-foreground">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <MapPinned className="h-4 w-4" aria-hidden />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">LeadMapper</span>
        </a>
        {DATA_SOURCE === "demo" ? (
          <p className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900 ring-1 ring-inset ring-amber-600/25">
            Démo : commerces fictifs
          </p>
        ) : (
          <p className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-900 ring-1 ring-inset ring-teal-600/25">
            Données Google Places
          </p>
        )}
      </div>
    </header>
  );
}
