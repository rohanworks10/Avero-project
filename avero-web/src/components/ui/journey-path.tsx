"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Clock,
  Coffee,
  Compass,
  Landmark,
  Mountain,
  Plus,
  ShoppingBag,
  Sparkles,
  Trees,
  Utensils,
} from "lucide-react";
import { getLiveListings, getListingById, type Listing } from "@/lib/listings";
import type { Trip, TripSlot } from "@/lib/trips-store";

export type JourneySlotItem = {
  slot: TripSlot;
  title: string;
  timeLabel: string;
  listingId: string | null;
};

export type JourneyPathProps = {
  dayNumber: number;
  date: string;
  slots: JourneySlotItem[];
  trip: Trip;
  onSelectListing: (listing: Listing) => void;
  onAddListing: (listingId: string, dayNumber: number, slot: TripSlot) => void;
};

function getCategoryIcon(category: string): React.ComponentType<{ className?: string }> {
  const cat = category.toLowerCase();
  if (cat.includes("heritage")) return Landmark;
  if (cat.includes("restaurant") || cat.includes("food")) return Utensils;
  if (cat.includes("cafe")) return Coffee;
  if (cat.includes("shop")) return ShoppingBag;
  if (cat.includes("adventure")) return Mountain;
  if (cat.includes("wellness")) return Sparkles;
  if (cat.includes("nature")) return Trees;
  return Compass;
}

function getNearbyListings(
  stopListing: Listing,
  trip: Trip
): Listing[] {
  const tripListingIds = new Set(
    trip.days
      .flatMap((d) => [d.morning, d.afternoon, d.evening])
      .filter((id): id is string => Boolean(id))
  );

  const allLive = getLiveListings().filter(
    (l) => l.id !== stopListing.id && !tripListingIds.has(l.id)
  );

  // 1. Same area
  const sameArea = allLive.filter((l) => l.area === stopListing.area);

  // 2. Same interest tags fallback
  const sameInterest = allLive.filter((l) =>
    l.interestTags.some((tag) => stopListing.interestTags.includes(tag))
  );

  const combined: Listing[] = [...sameArea];
  for (const item of sameInterest) {
    if (!combined.some((c) => c.id === item.id)) {
      combined.push(item);
    }
  }

  // 3. Fallback to any remaining live listings if still under 3
  if (combined.length < 3) {
    for (const item of allLive) {
      if (!combined.some((c) => c.id === item.id)) {
        combined.push(item);
      }
    }
  }

  return combined.slice(0, 3);
}

function SConnector({ isEven }: { isEven: boolean }) {
  return (
    <div className="relative my-1 flex h-16 w-full items-center justify-center overflow-hidden">
      {/* Decorative soft ambient dots */}
      <span
        aria-hidden="true"
        className="absolute left-[38%] top-[25%] size-2.5 rounded-full bg-amber/40 blur-[0.5px] sm:left-[45%]"
      />
      <span
        aria-hidden="true"
        className="absolute left-[62%] top-[65%] size-2 rounded-full bg-teal-navy/30 blur-[0.5px] sm:left-[55%]"
      />

      <svg
        className="h-full w-full"
        viewBox="0 0 100 64"
        fill="none"
        preserveAspectRatio="none"
      >
        {/* Mobile left-side curve */}
        <motion.path
          d={
            isEven
              ? "M 18 0 C 26 20, 10 44, 18 64"
              : "M 18 0 C 10 20, 26 44, 18 64"
          }
          className="sm:hidden"
          stroke="var(--terracotta)"
          strokeWidth="2.5"
          strokeDasharray="6 6"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
        />

        {/* Desktop centered S-curve */}
        <motion.path
          d={
            isEven
              ? "M 50 0 C 66 18, 34 46, 50 64"
              : "M 50 0 C 34 18, 66 46, 50 64"
          }
          className="hidden sm:inline"
          stroke="var(--terracotta)"
          strokeWidth="2.5"
          strokeDasharray="6 6"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}

export function JourneyPath({
  dayNumber,
  slots,
  trip,
  onSelectListing,
  onAddListing,
}: JourneyPathProps) {
  const resolvedSlots = useMemo(() => {
    return slots.map((item, idx) => {
      const listing = item.listingId ? getListingById(item.listingId) : null;
      const stopNumber = listing
        ? slots
            .slice(0, idx + 1)
            .filter((s) => s.listingId && getListingById(s.listingId)).length
        : null;
      return {
        ...item,
        listing,
        stopNumber,
      };
    });
  }, [slots]);

  return (
    <div className="relative py-4">
      {/* Start Marker */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-start sm:items-center"
      >
        <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 shadow-2xs">
          <span className="flex size-2 animate-ping rounded-full bg-primary" />
          <span className="font-serif text-xs font-semibold text-teal-navy sm:text-sm">
            Ready to go • Day {dayNumber} Begins
          </span>
        </div>
      </motion.div>

      {/* Connector from Start to Stop 1 */}
      <SConnector isEven={false} />

      {/* Stop Nodes & Cards */}
      <div className="space-y-0">
        {resolvedSlots.map((item, index) => {
          const currentStopNum = item.stopNumber;
          const isFilled = Boolean(item.listing);
          const isEven = index % 2 === 0;
          const listing = item.listing;
          const CategoryIcon = listing
            ? getCategoryIcon(listing.category)
            : Clock;

          const nearbyStores = listing
            ? getNearbyListings(listing, trip)
            : [];

          return (
            <div key={item.slot}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.18 }}
                className="relative"
              >
                {/* Mobile Layout (One column: line & node on left, card on right) */}
                <div className="flex items-start gap-4 sm:hidden">
                  {/* Left Node */}
                  <div className="relative flex shrink-0 flex-col items-center pt-2">
                    {isFilled ? (
                      <div className="relative flex size-14 items-center justify-center rounded-full border-2 border-dashed border-primary/60 bg-cream p-1 shadow-sm">
                        <div className="flex size-full items-center justify-center rounded-full bg-teal-navy text-primary-foreground shadow-xs">
                          <CategoryIcon className="size-5" />
                        </div>
                        <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-xs">
                          {currentStopNum}
                        </span>
                      </div>
                    ) : (
                      <div className="flex size-14 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/40 bg-cream/70 text-muted-foreground shadow-2xs">
                        <Clock className="size-5" />
                      </div>
                    )}
                  </div>

                  {/* Right Card */}
                  <div className="min-w-0 flex-1">
                    {listing ? (
                      <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs transition-all hover:border-primary/40 hover:shadow-sm">
                        <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-2">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                            {item.title} • {item.timeLabel}
                          </span>
                          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-bold text-teal-navy">
                            {listing.priceRange}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => onSelectListing(listing)}
                          className="mt-2 text-left transition-colors hover:text-primary"
                        >
                          <h3 className="font-serif text-base font-bold text-foreground">
                            {listing.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {listing.category} • {listing.area}
                          </p>
                        </button>

                        <div className="mt-2 flex items-center justify-between text-xs">
                          <span className="font-serif font-semibold text-teal-navy">
                            ₹{listing.avgCost.toLocaleString("en-IN")} avg / person
                          </span>
                          <button
                            type="button"
                            onClick={() => onSelectListing(listing)}
                            className="font-medium text-primary hover:underline"
                          >
                            Details &rarr;
                          </button>
                        </div>

                        {/* Nearby Stores Row (Mobile) */}
                        {nearbyStores.length > 0 && (
                          <div className="mt-3.5 border-t border-border/50 pt-2.5">
                            <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Nearby local stores:
                            </span>
                            <div className="mt-2 flex flex-col gap-1.5">
                              {nearbyStores.map((store) => (
                                <div
                                  key={store.id}
                                  className="flex items-center justify-between rounded-xl border border-border/60 bg-secondary/50 px-2.5 py-1.5 text-xs"
                                >
                                  <div className="min-w-0 pr-2">
                                    <p className="truncate font-medium text-foreground">
                                      {store.name}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                      {store.category} • {store.priceRange}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onAddListing(store.id, dayNumber, item.slot)
                                    }
                                    className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                                  >
                                    <Plus className="size-3" />
                                    <span>Add</span>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Empty Slot (Mobile) */
                      <div className="rounded-2xl border border-dashed border-border bg-card/60 p-4">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {item.title} • {item.timeLabel}
                        </span>
                        <h3 className="mt-1 font-serif text-sm font-semibold text-teal-navy">
                          Free time
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Open slot for spontaneous discovery.
                        </p>
                        <div className="mt-3">
                          <Link
                            href="/discover"
                            className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-card px-3 py-1 text-xs font-semibold text-primary shadow-2xs hover:bg-primary hover:text-primary-foreground"
                          >
                            <Plus className="size-3" />
                            <span>Add a place</span>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Desktop Layout (Center spine, alternating left & right cards) */}
                <div className="hidden sm:grid sm:grid-cols-11 sm:items-start sm:gap-6">
                  {/* Left Column (5 cols) */}
                  <div className="col-span-5 text-right">
                    {isEven && listing ? (
                      <div className="rounded-3xl border border-border/80 bg-card p-5 text-left shadow-xs transition-all hover:border-primary/40 hover:shadow-sm">
                        <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
                          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                            {item.title} • {item.timeLabel}
                          </span>
                          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-bold text-teal-navy">
                            {listing.priceRange}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => onSelectListing(listing)}
                          className="mt-2.5 block text-left transition-colors hover:text-primary"
                        >
                          <h3 className="font-serif text-lg font-bold text-foreground">
                            {listing.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {listing.category} • {listing.area}
                          </p>
                        </button>

                        <div className="mt-2.5 flex items-center justify-between text-xs">
                          <span className="font-serif font-bold text-teal-navy">
                            ₹{listing.avgCost.toLocaleString("en-IN")} avg / person
                          </span>
                          <button
                            type="button"
                            onClick={() => onSelectListing(listing)}
                            className="font-medium text-primary hover:underline"
                          >
                            View details &rarr;
                          </button>
                        </div>

                        {/* Nearby Stores Row */}
                        {nearbyStores.length > 0 && (
                          <div className="mt-4 border-t border-border/50 pt-3">
                            <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Nearby local stores:
                            </span>
                            <div className="mt-2 flex flex-col gap-2">
                              {nearbyStores.map((store) => (
                                <div
                                  key={store.id}
                                  className="flex items-center justify-between rounded-xl border border-border/60 bg-secondary/50 px-3 py-1.5 text-xs"
                                >
                                  <div className="min-w-0 pr-2">
                                    <p className="truncate font-medium text-foreground">
                                      {store.name}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                      {store.category} • {store.priceRange}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onAddListing(store.id, dayNumber, item.slot)
                                    }
                                    className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                                  >
                                    <Plus className="size-3" />
                                    <span>Add</span>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : isEven && !listing ? (
                      /* Empty slot on left */
                      <div className="rounded-3xl border border-dashed border-border bg-card/60 p-5 text-left">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {item.title} • {item.timeLabel}
                        </span>
                        <h3 className="mt-1 font-serif text-base font-semibold text-teal-navy">
                          Free time
                        </h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Open time for spontaneous exploration.
                        </p>
                        <div className="mt-3">
                          <Link
                            href="/discover"
                            className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-card px-3.5 py-1.5 text-xs font-semibold text-primary shadow-2xs hover:bg-primary hover:text-primary-foreground"
                          >
                            <Plus className="size-3" />
                            <span>Add a place</span>
                          </Link>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* Center Node (1 col) */}
                  <div className="col-span-1 flex flex-col items-center pt-3">
                    {isFilled ? (
                      <div className="relative flex size-16 items-center justify-center rounded-full border-2 border-dashed border-primary/60 bg-cream p-1 shadow-sm">
                        <div className="flex size-full items-center justify-center rounded-full bg-teal-navy text-primary-foreground shadow-xs">
                          <CategoryIcon className="size-6" />
                        </div>
                        <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-xs">
                          {currentStopNum}
                        </span>
                      </div>
                    ) : (
                      <div className="flex size-16 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/40 bg-cream/70 text-muted-foreground shadow-2xs">
                        <Clock className="size-6" />
                      </div>
                    )}
                  </div>

                  {/* Right Column (5 cols) */}
                  <div className="col-span-5 text-left">
                    {!isEven && listing ? (
                      <div className="rounded-3xl border border-border/80 bg-card p-5 text-left shadow-xs transition-all hover:border-primary/40 hover:shadow-sm">
                        <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
                          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                            {item.title} • {item.timeLabel}
                          </span>
                          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-bold text-teal-navy">
                            {listing.priceRange}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => onSelectListing(listing)}
                          className="mt-2.5 block text-left transition-colors hover:text-primary"
                        >
                          <h3 className="font-serif text-lg font-bold text-foreground">
                            {listing.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {listing.category} • {listing.area}
                          </p>
                        </button>

                        <div className="mt-2.5 flex items-center justify-between text-xs">
                          <span className="font-serif font-bold text-teal-navy">
                            ₹{listing.avgCost.toLocaleString("en-IN")} avg / person
                          </span>
                          <button
                            type="button"
                            onClick={() => onSelectListing(listing)}
                            className="font-medium text-primary hover:underline"
                          >
                            View details &rarr;
                          </button>
                        </div>

                        {/* Nearby Stores Row */}
                        {nearbyStores.length > 0 && (
                          <div className="mt-4 border-t border-border/50 pt-3">
                            <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Nearby local stores:
                            </span>
                            <div className="mt-2 flex flex-col gap-2">
                              {nearbyStores.map((store) => (
                                <div
                                  key={store.id}
                                  className="flex items-center justify-between rounded-xl border border-border/60 bg-secondary/50 px-3 py-1.5 text-xs"
                                >
                                  <div className="min-w-0 pr-2">
                                    <p className="truncate font-medium text-foreground">
                                      {store.name}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                      {store.category} • {store.priceRange}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      onAddListing(store.id, dayNumber, item.slot)
                                    }
                                    className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                                  >
                                    <Plus className="size-3" />
                                    <span>Add</span>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : !isEven && !listing ? (
                      /* Empty slot on right */
                      <div className="rounded-3xl border border-dashed border-border bg-card/60 p-5 text-left">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {item.title} • {item.timeLabel}
                        </span>
                        <h3 className="mt-1 font-serif text-base font-semibold text-teal-navy">
                          Free time
                        </h3>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Open time for spontaneous exploration.
                        </p>
                        <div className="mt-3">
                          <Link
                            href="/discover"
                            className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-card px-3.5 py-1.5 text-xs font-semibold text-primary shadow-2xs hover:bg-primary hover:text-primary-foreground"
                          >
                            <Plus className="size-3" />
                            <span>Add a place</span>
                          </Link>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </motion.div>

              {/* S-connector to next stop */}
              {index < resolvedSlots.length - 1 && (
                <SConnector isEven={isEven} />
              )}
            </div>
          );
        })}
      </div>

      {/* S-connector to End marker */}
      <SConnector isEven={resolvedSlots.length % 2 === 0} />

      {/* End Marker: Paper-plane */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: resolvedSlots.length * 0.18 + 0.2 }}
        className="flex flex-col items-start sm:items-center"
      >
        <div className="flex items-center gap-2.5 rounded-full border border-teal-navy/20 bg-card px-4 py-2 shadow-sm">
          {/* Avero Paper Plane SVG */}
          <div
            aria-hidden="true"
            className="flex size-7 items-center justify-center rounded-lg bg-teal-navy shadow-xs"
          >
            <svg viewBox="0 0 32 32" className="size-4" fill="none">
              <path
                d="M5 10.2 27.5 5 10.2 16.3l4.7-1.1L5 27l5.8-9.2 8.5-5.3-9.1 1.8L5 10.2Z"
                fill="var(--amber)"
              />
              <path
                d="m5 10.2 14.3 2.3-9.1 5.3-5.2-7.6Z"
                fill="var(--primary-foreground)"
              />
            </svg>
          </div>
          <span className="font-serif text-xs font-semibold text-teal-navy sm:text-sm">
            End of Day {dayNumber} • Rest & Recharge
          </span>
        </div>
      </motion.div>
    </div>
  );
}
