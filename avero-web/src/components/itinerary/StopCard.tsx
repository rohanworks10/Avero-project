import { LocalCard } from "@/components/itinerary/LocalCard";
import type { NearbyLocal, Listing } from "@/lib/listings";

type StopCardProps = {
  number: number;
  listing: Listing;
  time: string;
  duration: string;
  why: string;
  nearbyLocals: NearbyLocal[];
  addedLocalIds: Set<string>;
  onAddLocal: (local: NearbyLocal) => void;
  onRemove: (listingId: string) => void;
  onSelect: (listing: Listing) => void;
};

export function StopCard({
  number,
  listing,
  time,
  duration,
  why,
  nearbyLocals,
  addedLocalIds,
  onAddLocal,
  onRemove,
  onSelect,
}: StopCardProps) {
  return (
    <article className="relative grid grid-cols-[2.25rem_minmax(0,1fr)] items-start gap-x-3 sm:grid-cols-[2.5rem_minmax(0,1fr)] sm:gap-x-4">
      <div className="relative z-10 flex size-9 items-center justify-center rounded-full bg-terracotta text-sm font-bold text-white sm:size-10">
        {number}
      </div>

      <div className="min-w-0">
        <div className="rounded-2xl border border-teal-navy/10 bg-white p-4 sm:rounded-3xl sm:p-5">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-terracotta">
            <span>{time}</span>
            <span aria-hidden="true" className="size-1 rounded-full bg-amber" />
            <span className="text-teal-navy/65">{duration}</span>
            <span className="ml-auto rounded-full bg-cream px-2.5 py-1 text-xs font-bold tracking-normal text-teal-navy">
              {listing.priceRange}
            </span>
          </div>

          <div className="mt-2 flex items-start justify-between gap-3">
            <button
              type="button"
              onClick={() => onSelect(listing)}
              className="min-w-0 text-left"
            >
              <h3 className="font-serif text-lg font-semibold leading-snug text-teal-navy sm:text-xl">
                {listing.name}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {listing.category} · {listing.area}
              </p>
            </button>

            <button
              type="button"
              onClick={() => onRemove(listing.id)}
              aria-label={`Remove ${listing.name} from itinerary`}
              className="flex size-8 shrink-0 items-center justify-center rounded-full text-teal-navy/55 transition-colors hover:bg-terracotta/10 hover:text-terracotta"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                fill="none"
                className="size-4"
              >
                <path
                  d="M3 4.5h10M6 4.5V3h4v1.5m2 0-.5 8h-7l-.5-8M6.5 7v3.5M9.5 7v3.5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 border-t border-teal-navy/8 pt-3">
            <p className="line-clamp-1 text-xs text-teal-navy/75">{why}</p>
            <p className="shrink-0 text-sm font-semibold text-teal-navy">
              ₹{listing.avgCost.toLocaleString("en-IN")}
              <span className="ml-1 text-[10px] font-normal text-muted-foreground">
                / person
              </span>
            </p>
          </div>
        </div>

        {nearbyLocals.length > 0 && (
          <section className="mt-4" aria-label={`Locals near ${listing.name}`}>
            <div className="mb-2.5 flex items-center justify-between gap-3">
              <h4 className="font-serif text-base font-semibold text-teal-navy">
                Locals near this stop
              </h4>
              <span className="text-[10px] font-medium text-muted-foreground">
                {nearbyLocals.length} nearby
              </span>
            </div>
            <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
              {nearbyLocals.map((local) => (
                <LocalCard
                  key={local.id}
                  local={local}
                  isAdded={addedLocalIds.has(local.id)}
                  onAdd={onAddLocal}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
