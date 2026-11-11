import type { NearbyLocal } from "@/lib/listings";

type LocalCardProps = {
  local: NearbyLocal;
  isAdded: boolean;
  onAdd: (local: NearbyLocal) => void;
};

export function LocalCard({ local, isAdded, onAdd }: LocalCardProps) {
  return (
    <article className="w-[230px] shrink-0 snap-start overflow-hidden rounded-2xl border border-teal-navy/10 bg-white">
      <div className="flex h-24 items-center justify-center bg-[#F3E7DC] text-terracotta">
        <svg
          aria-hidden="true"
          viewBox="0 0 48 48"
          fill="none"
          className="size-10"
        >
          <path
            d="M8 20h32v20H8zM6 17l3-9h30l3 9M6 17a4 4 0 0 0 8 0 4 4 0 0 0 8 0 4 4 0 0 0 8 0 4 4 0 0 0 8 0 4 4 0 0 0 8 0M18 40V27h12v13"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="truncate font-serif text-base font-semibold text-teal-navy">
              {local.name}
            </h4>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {local.category} · {local.priceRange}
            </p>
            <p className="mt-1 truncate text-[10px] text-teal-navy/65">
              {local.shortDescription}
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-teal-navy/8 px-2 py-1 text-[10px] font-semibold text-teal-navy">
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              fill="none"
              className="size-3"
            >
              <path
                d="M8 14s5-4.2 5-8A5 5 0 0 0 3 6c0 3.8 5 8 5 8Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <circle cx="8" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            {local.walkMinutes} min walk
          </span>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber/20 px-2 py-1 text-[10px] font-semibold text-teal-navy">
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              fill="none"
              className="size-3 text-teal-navy"
            >
              <path
                d="m8 1.5 1.7 1.2 2.1.1.7 2 1.5 1.4-.7 2 .3 2.1-1.8 1.1-1 1.8-2.1-.4-2 .7-1.3-1.6-2-.7.1-2.1L2 7.3l1.3-1.7.2-2.1 2-.6L7 1.5h1Z"
                fill="currentColor"
              />
              <path
                d="m5.5 8 1.6 1.6 3.4-3.5"
                stroke="white"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Verified
          </span>
          <span className="rounded-full bg-terracotta/10 px-2 py-1 text-[10px] font-bold text-terracotta">
            {local.matchPercent}% match
          </span>
        </div>

        <p className="mt-2 line-clamp-2 min-h-8 text-[11px] leading-relaxed text-muted-foreground">
          {local.reason}
        </p>

        <button
          type="button"
          onClick={() => onAdd(local)}
          disabled={isAdded}
          aria-label={
            isAdded ? `${local.name} added to trip` : `Add ${local.name} to trip`
          }
          className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition-colors ${
            isAdded
              ? "bg-teal-navy/10 text-teal-navy"
              : "bg-terracotta text-white hover:bg-terracotta/90"
          }`}
        >
          {isAdded ? (
            <>
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                fill="none"
                className="size-3.5"
              >
                <path
                  d="m3 8 3.2 3.2L13 4.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Added to trip
            </>
          ) : (
            <>
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                fill="none"
                className="size-3.5"
              >
                <path
                  d="M8 3v10M3 8h10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Add to trip
            </>
          )}
        </button>
      </div>
    </article>
  );
}
