"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Clock,
  Coffee,
  Compass,
  Landmark,
  MapPin,
  Mountain,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Trash2,
  Trees,
  Utensils,
  X,
} from "lucide-react";
import { getAllListings, getListingById, type Listing, type PriceRange } from "@/lib/listings";
import type { Trip, TripSlot } from "@/lib/trips-store";

export type JourneySlotItem = {
  slot: TripSlot;
  title: string;
  timeLabel: string;
  listingId: string | null;
  stop?: Listing | null;
  addedStores?: string[];
};

export type JourneyPathProps = {
  dayNumber: number;
  date: string;
  slots: JourneySlotItem[];
  trip: Trip;
  onSelectListing: (listing: Listing) => void;
  onAddListing?: (listingId: string, dayNumber: number, slot: TripSlot) => void;
  onAddStore?: (storeId: string, dayNumber: number, slot: TripSlot) => void;
  onRemoveStore?: (storeId: string, dayNumber: number, slot: TripSlot) => void;
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

function getPriceTier(p: PriceRange): number {
  if (p === "₹") return 1;
  if (p === "₹₹") return 2;
  return 3;
}

/**
 * Ranked suggestions for a main stop:
 * - Up to 3 suggestions from same destination
 * - Not already added to any stop today
 * - Not a main stop of today
 * - Ranking: same area first, then same interest tags, then closest price level
 * - If no same-area store exists, still returns best matches (never an empty section)
 */
export function getNearbyListings(
  stopListing: Listing,
  destination: string,
  dayMainStopIds: Set<string>,
  allDayAddedStoreIds: Set<string>
): Listing[] {
  const destLower = (destination || "").toLowerCase().trim();
  const availableListings = getAllListings().filter((l) => l.status !== "pending");

  // Candidates: from destination, not current stop, not main stop of today, not already added
  let candidates = availableListings.filter((l) => {
    if (l.id === stopListing.id) return false;
    if (dayMainStopIds.has(l.id)) return false;
    if (allDayAddedStoreIds.has(l.id)) return false;
    if (destLower && !l.area.toLowerCase().includes(destLower) && !destLower.includes("belagavi")) {
      return false;
    }
    return true;
  });

  // Fallback to any available listings not already in day if destination filter was too strict
  if (candidates.length === 0) {
    candidates = availableListings.filter(
      (l) => l.id !== stopListing.id && !dayMainStopIds.has(l.id) && !allDayAddedStoreIds.has(l.id)
    );
  }

  const stopArea = stopListing.area.split(",")[0].trim().toLowerCase();
  const stopInterests = new Set(stopListing.interestTags.map((t) => t.toLowerCase().trim()));
  const stopPriceTier = getPriceTier(stopListing.priceRange);

  const ranked = [...candidates].sort((a, b) => {
    // 1. Same area first
    const aArea = a.area.split(",")[0].trim().toLowerCase();
    const bArea = b.area.split(",")[0].trim().toLowerCase();
    const aSameArea = aArea === stopArea ? 1 : 0;
    const bSameArea = bArea === stopArea ? 1 : 0;
    if (aSameArea !== bSameArea) {
      return bSameArea - aSameArea;
    }

    // 2. Same interest tags (number of overlapping tags, higher is better)
    const aOverlap = a.interestTags.filter((t) => stopInterests.has(t.toLowerCase().trim())).length;
    const bOverlap = b.interestTags.filter((t) => stopInterests.has(t.toLowerCase().trim())).length;
    if (aOverlap !== bOverlap) {
      return bOverlap - aOverlap;
    }

    // 3. Closest price level (smallest tier difference is better)
    const aPriceDiff = Math.abs(getPriceTier(a.priceRange) - stopPriceTier);
    const bPriceDiff = Math.abs(getPriceTier(b.priceRange) - stopPriceTier);
    if (aPriceDiff !== bPriceDiff) {
      return aPriceDiff - bPriceDiff;
    }

    return a.name.localeCompare(b.name);
  });

  return ranked.slice(0, 3);
}

function SConnector({ isEven }: { isEven: boolean }) {
  return (
    <div className="relative my-1 flex h-16 w-full items-center justify-center overflow-hidden">
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

type ResolvedStopItem = Omit<JourneySlotItem, "addedStores"> & {
  listing: Listing | null;
  stop: Listing | null;
  stopNumber: number | null;
  addedStores: Listing[];
};

export function JourneyPath({
  dayNumber,
  slots,
  trip,
  onSelectListing,
  onAddStore,
  onRemoveStore,
}: JourneyPathProps) {
  const destination = trip.destination ? trip.destination.split(",")[0].trim() : "Belagavi";

  // Destination stores for Browse modal
  const destinationStores = useMemo(() => {
    const destLower = destination.toLowerCase();
    const all = getAllListings().filter((l) => l.status !== "pending");
    const filtered = all.filter(
      (l) => l.area.toLowerCase().includes(destLower) || destLower.includes("belagavi")
    );
    return filtered.length > 0 ? filtered : all;
  }, [destination]);

  // Categories for filter chips in Browse modal
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const s of destinationStores) {
      if (s.category) set.add(s.category);
    }
    return ["All", ...Array.from(set).sort()];
  }, [destinationStores]);

  // Browse modal state
  const [activeModalSlot, setActiveModalSlot] = useState<TripSlot | null>(null);
  const [modalSearchQuery, setModalSearchQuery] = useState("");
  const [selectedModalCategory, setSelectedModalCategory] = useState("All");

  // Sync state with trip days or props if provided
  const dayFromTrip = trip?.days?.find((d) => d.dayNumber === dayNumber);

  const dayStoresFromTrip = useMemo(() => {
    return {
      morning:
        dayFromTrip?.addedStores?.morning ??
        slots.find((s) => s.slot === "morning")?.addedStores ??
        [],
      afternoon:
        dayFromTrip?.addedStores?.afternoon ??
        slots.find((s) => s.slot === "afternoon")?.addedStores ??
        [],
      evening:
        dayFromTrip?.addedStores?.evening ??
        slots.find((s) => s.slot === "evening")?.addedStores ??
        [],
    };
  }, [dayFromTrip, slots]);

  const [addedStoresBySlot, setAddedStoresBySlot] =
    useState<Record<TripSlot, string[]>>(dayStoresFromTrip);
  const [prevTripStores, setPrevTripStores] = useState(dayStoresFromTrip);

  if (prevTripStores !== dayStoresFromTrip) {
    setPrevTripStores(dayStoresFromTrip);
    setAddedStoresBySlot(dayStoresFromTrip);
  }

  // Set of all store IDs added across any slot on this day (enforce once per day)
  const allDayAddedStoreIds = useMemo(() => {
    const ids = new Set<string>();
    for (const slotKey of ["morning", "afternoon", "evening"] as TripSlot[]) {
      const list = addedStoresBySlot[slotKey] || [];
      for (const id of list) {
        ids.add(id);
      }
    }
    return ids;
  }, [addedStoresBySlot]);

  // Main stop IDs for THIS day
  const dayMainStopIds = useMemo(() => {
    return new Set(
      slots
        .map((s) => s.stop?.id ?? (s.listingId ? getListingById(s.listingId)?.id : null))
        .filter((id): id is string => Boolean(id))
    );
  }, [slots]);

  const handleAddStore = (slot: TripSlot, storeId: string) => {
    // Prevent duplicate: a store can only be added once per day
    if (allDayAddedStoreIds.has(storeId)) return;

    setAddedStoresBySlot((prev) => ({
      ...prev,
      [slot]: [...(prev[slot] || []), storeId],
    }));

    onAddStore?.(storeId, dayNumber, slot);
  };

  const handleRemoveStore = (slot: TripSlot, storeId: string) => {
    setAddedStoresBySlot((prev) => ({
      ...prev,
      [slot]: (prev[slot] || []).filter((id) => id !== storeId),
    }));

    onRemoveStore?.(storeId, dayNumber, slot);
  };

  // Each stop keeps its own data: { stop, addedStores: [] }
  // Main stops are never overwritten or reordered
  const resolvedSlots: ResolvedStopItem[] = useMemo(() => {
    let stopCount = 0;
    return slots.map((item) => {
      const listing = item.stop ?? (item.listingId ? getListingById(item.listingId) : null);
      const stopNumber = listing ? ++stopCount : null;
      const storeIds = addedStoresBySlot[item.slot] || [];
      const addedStoreListings = storeIds
        .map((id) => getListingById(id))
        .filter((l): l is Listing => Boolean(l));

      return {
        ...item,
        listing,
        stop: listing,
        stopNumber,
        addedStores: addedStoreListings,
      };
    });
  }, [slots, addedStoresBySlot]);

  // Budget calculations: Budget total = main stops + added stores
  const mainStopsCost = useMemo(() => {
    return resolvedSlots.reduce((sum, item) => {
      return sum + (item.stop ? item.stop.avgCost : 0);
    }, 0);
  }, [resolvedSlots]);

  const addedStoresCost = useMemo(() => {
    return resolvedSlots.reduce((sum, item) => {
      const storesCost = item.addedStores.reduce(
        (storeSum, store) => storeSum + store.avgCost,
        0
      );
      return sum + storesCost;
    }, 0);
  }, [resolvedSlots]);

  const budgetTotal = mainStopsCost + addedStoresCost;

  // Filtered stores in Browse Modal
  const modalFilteredStores = useMemo(() => {
    return destinationStores.filter((store) => {
      const matchesCategory =
        selectedModalCategory === "All" || store.category === selectedModalCategory;
      const query = modalSearchQuery.trim().toLowerCase();
      const matchesQuery =
        !query ||
        store.name.toLowerCase().includes(query) ||
        store.area.toLowerCase().includes(query) ||
        store.category.toLowerCase().includes(query) ||
        store.interestTags.some((t) => t.toLowerCase().includes(query));
      return matchesCategory && matchesQuery;
    });
  }, [destinationStores, selectedModalCategory, modalSearchQuery]);

  // Reusable card body for mobile and desktop stop cards
  const renderStopCardBody = (item: ResolvedStopItem) => {
    const listing = item.stop;
    if (!listing) return null;

    // Nearby suggestions: ALWAYS visible, up to 3, ranked
    const nearbyStores = getNearbyListings(
      listing,
      destination,
      dayMainStopIds,
      allDayAddedStoreIds
    );

    const stopTotalCost =
      listing.avgCost + item.addedStores.reduce((sum, s) => sum + s.avgCost, 0);

    return (
      <>
        {/* Header: Title, time label, price badge */}
        <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            {item.title} • {item.timeLabel}
          </span>
          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-bold text-teal-navy">
            {listing.priceRange}
          </span>
        </div>

        {/* Main Stop Info */}
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

        {/* 1. Added stores section: shows added stores with price + Remove button. Hide only when empty. */}
        {item.addedStores.length > 0 && (
          <div className="mt-4 border-t border-border/50 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-navy">
                Added to this stop ({item.addedStores.length}):
              </span>
              <span className="text-xs font-medium text-primary">
                +₹
                {item.addedStores
                  .reduce((s, st) => s + st.avgCost, 0)
                  .toLocaleString("en-IN")}
              </span>
            </div>
            <div className="mt-2 flex flex-col gap-2">
              {item.addedStores.map((store) => (
                <div
                  key={store.id}
                  className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="truncate font-medium text-foreground">
                      {store.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {store.category} • {store.priceRange} • ₹
                      {store.avgCost.toLocaleString("en-IN")} avg / person
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveStore(item.slot, store.id)}
                    aria-label={`Remove ${store.name}`}
                    className="inline-flex shrink-0 items-center gap-1 rounded-full border border-destructive/30 bg-card px-2.5 py-1 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <Trash2 className="size-3" />
                    <span>Remove</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stop Subtotal if stores were added */}
        {item.addedStores.length > 0 && (
          <div className="mt-2.5 flex items-center justify-between border-t border-border/40 pt-2 text-xs text-teal-navy/80">
            <span className="font-medium">Stop subtotal:</span>
            <span className="font-serif font-bold text-teal-navy">
              ₹{stopTotalCost.toLocaleString("en-IN")} avg / person
            </span>
          </div>
        )}

        {/* 2. Nearby local stores section: ALWAYS visible. Show up to 3 suggestions */}
        <div className="mt-4 border-t border-border/50 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Nearby local stores:
            </span>
            <span className="text-[10px] text-muted-foreground">
              {nearbyStores.length > 0 ? `${nearbyStores.length} suggestions` : "Best local picks"}
            </span>
          </div>

          <div className="mt-2 flex flex-col gap-2">
            {nearbyStores.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border/70 p-2.5 text-center text-xs text-muted-foreground">
                All nearby suggestions have been added for today!
              </p>
            ) : (
              nearbyStores.map((store) => (
                <div
                  key={store.id}
                  className="flex items-center justify-between rounded-xl border border-border/60 bg-secondary/50 px-3 py-1.5 text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="truncate font-medium text-foreground">
                      {store.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {store.category} • {store.priceRange} • ₹
                      {store.avgCost.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddStore(item.slot, store.id)}
                    aria-label={`Add ${store.name} to this stop`}
                    className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    <Plus className="size-3" />
                    <span>Add</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3. Browse all stores in {destination} button on EVERY card */}
        <div className="mt-4 border-t border-border/40 pt-3">
          <button
            type="button"
            onClick={() => {
              setActiveModalSlot(item.slot);
              setModalSearchQuery("");
              setSelectedModalCategory("All");
            }}
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-teal-navy/20 bg-secondary/60 px-3.5 py-2 text-xs font-semibold text-teal-navy transition-all hover:border-primary/40 hover:bg-secondary hover:text-primary"
          >
            <Search className="size-3.5" />
            <span>+ Browse all stores in {destination}</span>
          </button>
        </div>
      </>
    );
  };

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

      {/* Day Budget Total Summary Banner */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="my-3 flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-teal-navy/15 bg-white/95 px-4 py-2.5 text-xs shadow-xs"
      >
        <span className="font-semibold text-teal-navy sm:text-sm">
          Day {dayNumber} Budget Total:
        </span>
        <span className="font-serif text-sm font-bold text-primary sm:text-base">
          ₹{budgetTotal.toLocaleString("en-IN")}
        </span>
        <span className="text-[11px] text-muted-foreground">
          (Main stops: ₹{mainStopsCost.toLocaleString("en-IN")} + Added stores: ₹
          {addedStoresCost.toLocaleString("en-IN")})
        </span>
      </motion.div>

      {/* Connector from Start to Stop 1 */}
      <SConnector isEven={false} />

      {/* Stop Nodes & Cards */}
      <div className="space-y-0">
        {resolvedSlots.map((item, index) => {
          const currentStopNum = item.stopNumber;
          const isFilled = Boolean(item.stop);
          const isEven = index % 2 === 0;
          const listing = item.stop;
          const CategoryIcon = listing ? getCategoryIcon(listing.category) : Clock;

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
                  {/* Left Node - Numbered journey markers stay for main stops only */}
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
                        {renderStopCardBody(item)}
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
                        {renderStopCardBody(item)}
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

                  {/* Center Node (1 col) - Numbered journey markers stay for main stops only */}
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
                        {renderStopCardBody(item)}
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

      {/* End Marker: Paper-plane with Budget Total */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: resolvedSlots.length * 0.18 + 0.2 }}
        className="flex flex-col items-start sm:items-center"
      >
        <div className="flex items-center gap-2.5 rounded-full border border-teal-navy/20 bg-card px-4 py-2 shadow-sm">
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
            End of Day {dayNumber} • Rest & Recharge · Budget Total: ₹
            {budgetTotal.toLocaleString("en-IN")}
          </span>
        </div>
      </motion.div>

      {/* 3. Browse Modal / Bottom Sheet */}
      <AnimatePresence>
        {activeModalSlot !== null && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="browse-modal-title"
            className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setActiveModalSlot(null);
                setModalSearchQuery("");
                setSelectedModalCategory("All");
              }}
              className="fixed inset-0 bg-teal-navy/40 backdrop-blur-xs"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              className="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col rounded-t-3xl border border-border/80 bg-card shadow-2xl sm:rounded-3xl"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-border/50 p-5 sm:p-6">
                <div>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    {slots.find((s) => s.slot === activeModalSlot)?.title} Stop
                  </span>
                  <h3
                    id="browse-modal-title"
                    className="mt-1.5 font-serif text-xl font-bold text-teal-navy sm:text-2xl"
                  >
                    Browse all stores in {destination}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Add authentic local spots to your {activeModalSlot} stop.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveModalSlot(null);
                    setModalSearchQuery("");
                    setSelectedModalCategory("All");
                  }}
                  aria-label="Close browse modal"
                  className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Search & Category Filter Controls */}
              <div className="border-b border-border/40 p-4 sm:px-6 space-y-3">
                {/* Search Box */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={modalSearchQuery}
                    onChange={(e) => setModalSearchQuery(e.target.value)}
                    placeholder={`Search places in ${destination} by name, area, tag...`}
                    className="h-10 w-full rounded-full border border-border bg-background pl-10 pr-4 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden"
                  />
                  {modalSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setModalSearchQuery("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>

                {/* Category Filter Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  {categories.map((cat) => {
                    const active = selectedModalCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedModalCategory(cat)}
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                          active
                            ? "bg-primary text-primary-foreground shadow-2xs"
                            : "border border-border/70 bg-card text-muted-foreground hover:text-foreground hover:bg-secondary"
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scrollable Store List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2.5">
                {modalFilteredStores.length === 0 ? (
                  <div className="py-12 text-center">
                    <Compass className="mx-auto size-8 text-muted-foreground" />
                    <p className="mt-2 text-sm font-medium text-foreground">
                      No stores found
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Try clearing your search or category filter.
                    </p>
                  </div>
                ) : (
                  modalFilteredStores.map((store) => {
                    const isAddedToThisStop = (
                      addedStoresBySlot[activeModalSlot] || []
                    ).includes(store.id);
                    const isMainStopToday = dayMainStopIds.has(store.id);
                    const isAddedToOtherStopToday =
                      !isAddedToThisStop && allDayAddedStoreIds.has(store.id);

                    return (
                      <div
                        key={store.id}
                        className="flex flex-col justify-between gap-3 rounded-2xl border border-border/70 bg-card p-3.5 transition-all hover:border-primary/40 sm:flex-row sm:items-center"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-serif text-sm font-bold text-foreground">
                              {store.name}
                            </h4>
                            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-teal-navy">
                              {store.category}
                            </span>
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                              {store.priceRange}
                            </span>
                          </div>

                          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="size-3 shrink-0 text-primary" />
                            <span>{store.area}</span>
                            <span>•</span>
                            <span className="font-serif font-semibold text-teal-navy">
                              ₹{store.avgCost.toLocaleString("en-IN")} avg / person
                            </span>
                          </p>

                          <p className="mt-1 line-clamp-1 text-xs text-foreground/80">
                            {store.description}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {isAddedToThisStop ? (
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 rounded-full bg-teal-navy/10 px-2.5 py-1 text-xs font-semibold text-teal-navy">
                                <Check className="size-3" />
                                <span>Added</span>
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveStore(activeModalSlot, store.id)
                                }
                                className="rounded-full border border-destructive/30 px-2.5 py-1 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10"
                              >
                                Remove
                              </button>
                            </div>
                          ) : isMainStopToday ? (
                            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                              Main stop
                            </span>
                          ) : isAddedToOtherStopToday ? (
                            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                              Added to other stop
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                handleAddStore(activeModalSlot, store.id)
                              }
                              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
                            >
                              <Plus className="size-3.5" />
                              <span>Add</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
