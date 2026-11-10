"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  Landmark,
  MapPin,
  Palette,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Trees,
  Utensils,
  Wine,
  X,
} from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { useWizard } from "@/providers/WizardProvider";
import { getLiveListings, type Listing, type PriceRange } from "@/lib/listings";
import { interests, getInterestById } from "@/data/interests";
import {
  getCurrentTrip,
  addListingToTrip,
  type TripSlot,
} from "@/lib/trips-store";

// Map interest icon names to Lucide components
const INTEREST_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Utensils,
  Landmark,
  Trees,
  Compass,
  ShoppingBag,
  Wine,
  Sparkles,
  Palette,
};

const PRICE_RANGES: PriceRange[] = ["₹", "₹₹", "₹₹₹"];

function DiscoverInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: wizardData } = useWizard();

  // Parse URL params
  const dayParam = useMemo(() => {
    const d = searchParams.get("day");
    if (!d || !/^\d+$/.test(d)) return undefined;
    const day = Number(d);
    return Number.isSafeInteger(day) && day > 0 ? day : undefined;
  }, [searchParams]);

  const slotParam = useMemo(() => {
    const s = searchParams.get("slot");
    if (s === "morning" || s === "afternoon" || s === "evening") return s as TripSlot;
    return undefined;
  }, [searchParams]);

  // State
  const [listings, setListings] = useState<Listing[]>([]);
  const [hasTrip, setHasTrip] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedPrices, setSelectedPrices] = useState<PriceRange[]>([]);
  const [sortSelection, setSortSelection] = useState<
    "best" | "price-asc" | "price-desc" | null
  >(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [detailListing, setDetailListing] = useState<Listing | null>(null);

  // Load listings on mount (localStorage-dependent)
  useEffect(() => {
    const liveListings = getLiveListings();
    const currentTripExists = getCurrentTrip() !== null;
    queueMicrotask(() => {
      setListings(liveListings);
      setHasTrip(currentTripExists);
    });
  }, []);

  const sortBy =
    sortSelection === "best" && wizardData.interests.length === 0
      ? "price-asc"
      : (sortSelection ??
        (wizardData.interests.length > 0 ? "best" : "price-asc"));

  // Filter + sort logic
  const filtered = useMemo(() => {
    let result = [...listings];

    // 1. Search filter
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q) ||
          l.area.toLowerCase().includes(q) ||
          l.interestTags.join(" ").toLowerCase().includes(q)
      );
    }

    // 2. Interest filter
    if (selectedInterests.length > 0) {
      result = result.filter((l) =>
        l.interestTags.some((tag) => selectedInterests.includes(tag))
      );
    }

    // 3. Price range filter
    if (selectedPrices.length > 0) {
      result = result.filter((l) => selectedPrices.includes(l.priceRange));
    }

    // 4. Sort
    if (sortBy === "best") {
      result = result.slice().sort((a, b) => {
        const aCount = a.interestTags.filter((t) =>
          wizardData.interests.includes(t)
        ).length;
        const bCount = b.interestTags.filter((t) =>
          wizardData.interests.includes(t)
        ).length;
        return bCount - aCount;
      });
    } else if (sortBy === "price-asc") {
      result = result.slice().sort((a, b) => a.avgCost - b.avgCost);
    } else if (sortBy === "price-desc") {
      result = result.slice().sort((a, b) => b.avgCost - a.avgCost);
    }

    return result;
  }, [listings, search, selectedInterests, selectedPrices, sortBy, wizardData.interests]);

  function resetFilters() {
    setSearch("");
    setSelectedInterests([]);
    setSelectedPrices([]);
    setSortSelection(null);
  }

  function toggleInterest(id: string) {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function togglePrice(p: PriceRange) {
    setSelectedPrices((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }

  function handleAddToTrip(listing: Listing) {
    const trip = getCurrentTrip();
    if (!trip) {
      setHasTrip(false);
      return;
    }

    const hasSlotTarget = dayParam !== undefined && slotParam !== undefined;
    if (
      hasSlotTarget &&
      !trip.days.some((day) => day.dayNumber === dayParam)
    ) {
      return;
    }

    const updatedTrip = addListingToTrip(listing.id, dayParam, slotParam);
    if (!updatedTrip) {
      setHasTrip(false);
      return;
    }
    setHasTrip(true);
    setAddedIds((prev) => new Set([...prev, listing.id]));

    // If day+slot params present, navigate to itinerary immediately
    if (hasSlotTarget) {
      router.push("/trip/itinerary");
    }
  }

  function handleAddToTripFromDialog(listing: Listing) {
    handleAddToTrip(listing);
    setDetailListing(null);
  }

  const sortOptions: { label: string; value: "best" | "price-asc" | "price-desc" }[] = [
    ...(wizardData.interests.length > 0
      ? [{ label: "Best match to my interests", value: "best" as const }]
      : []),
    { label: "Price: low to high", value: "price-asc" as const },
    { label: "Price: high to low", value: "price-desc" as const },
  ];

  const hasActiveFilters =
    search.trim().length > 0 ||
    selectedInterests.length > 0 ||
    selectedPrices.length > 0;

  return (
    <div className="flex min-h-screen flex-col bg-cream text-foreground">
      <Navbar />

      <main className="avero-gradient flex-1 pb-16 pt-8 sm:pb-24 sm:pt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <section className="mb-8 text-center sm:mb-10 sm:text-left">
            {dayParam !== undefined && slotParam !== undefined && (
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
                <Plus className="size-3.5" />
                <span>
                  Adding to Day {dayParam} · {slotParam.charAt(0).toUpperCase() + slotParam.slice(1)}
                </span>
              </div>
            )}
            <h1 className="font-serif text-3xl font-bold tracking-tight text-teal-navy sm:text-4xl lg:text-5xl">
              Discover local Belagavi
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
              Find authentic experiences, local gems, and hidden stops for your Belagavi trip.
            </p>
          </section>

          {/* Filters Bar */}
          <section className="mb-8 space-y-4 rounded-3xl border border-border/80 bg-card p-5 shadow-xs sm:p-6">
            {/* Search + Sort row */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search places, categories, areas…"
                  className="w-full rounded-full border border-border bg-secondary/60 py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              {/* Sort dropdown */}
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortSelection(
                    e.target.value as "best" | "price-asc" | "price-desc"
                  )
                }
                className="rounded-full border border-border/80 bg-card px-4 py-2.5 text-sm font-medium text-teal-navy focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Interest chips */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Interests
              </span>
              {interests.map((interest) => {
                const Icon = INTEREST_ICON_MAP[interest.icon];
                const isActive = selectedInterests.includes(interest.id);
                return (
                  <button
                    key={interest.id}
                    type="button"
                    onClick={() => toggleInterest(interest.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary/80 text-teal-navy hover:bg-secondary"
                    }`}
                  >
                    {Icon && <Icon className="size-3.5" />}
                    {interest.label}
                  </button>
                );
              })}
            </div>

            {/* Price range + Clear row */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Price
                </span>
                {PRICE_RANGES.map((p) => {
                  const isActive = selectedPrices.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePrice(p)}
                      className={`rounded-full px-3.5 py-1 text-xs font-bold transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary/80 text-teal-navy hover:bg-secondary"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary underline-offset-2 hover:underline"
                >
                  <X className="size-3.5" />
                  Clear filters
                </button>
              )}
            </div>
          </section>

          {/* Results count */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filtered.length}{" "}
              {filtered.length === 1 ? "place" : "places"} found
            </p>
          </div>

          {/* Listing Grid or Empty State */}
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center rounded-3xl border border-border/80 bg-card p-14 text-center shadow-xs"
            >
              <div className="flex size-14 items-center justify-center rounded-2xl bg-amber/20 text-teal-navy">
                <Compass className="size-7" />
              </div>
              <h2 className="mt-4 font-serif text-2xl font-semibold text-teal-navy">
                No places found
              </h2>
              <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
                Try different interests or clear your filters
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                Clear filters
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((listing) => {
                const isAdded = addedIds.has(listing.id);

                return (
                  <motion.div
                    key={listing.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="relative flex flex-col overflow-hidden rounded-3xl border border-border/80 bg-card p-6 shadow-xs transition-shadow hover:shadow-sm"
                  >
                    {/* Top: Category + Verified badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-secondary px-3 py-0.5 text-xs font-semibold text-teal-navy">
                        {listing.category}
                      </span>
                      {listing.status === "live" && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-green-700">
                          <CheckCircle2 className="size-3" />
                          Verified
                        </span>
                      )}
                    </div>

                    {/* Name + Price row */}
                    <div className="mt-3 flex items-start justify-between gap-2">
                      <h2 className="font-serif text-xl font-bold leading-tight text-foreground">
                        {listing.name}
                      </h2>
                      <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                        {listing.priceRange}
                      </span>
                    </div>

                    {/* Area */}
                    <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3.5 shrink-0 text-primary" />
                      {listing.area}
                    </p>

                    {/* Avg Cost */}
                    <p className="mt-1 text-xs text-muted-foreground">
                      Avg cost:{" "}
                      <span className="font-semibold text-teal-navy">
                        ₹{listing.avgCost.toLocaleString("en-IN")}
                        <span className="font-normal text-muted-foreground"> / person</span>
                      </span>
                    </p>

                    {/* Description */}
                    <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-foreground/80 sm:text-sm">
                      {listing.description}
                    </p>

                    {/* Interest Tag Chips */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {listing.interestTags.map((tag) => {
                        const obj = getInterestById(tag);
                        return (
                          <span
                            key={tag}
                            className="rounded-full bg-secondary/80 px-2.5 py-0.5 text-[11px] font-medium text-teal-navy"
                          >
                            {obj ? obj.label : tag}
                          </span>
                        );
                      })}
                    </div>

                    {/* Actions */}
                    <div className="mt-5 flex items-center gap-2 border-t border-border/50 pt-4">
                      {/* Add to trip / Start a trip */}
                      {!hasTrip ? (
                        <Link
                          href="/onboarding/trip-setup"
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                        >
                          <Plus className="size-3.5" />
                          Start a trip
                        </Link>
                      ) : isAdded ? (
                        <Link
                          href="/trip/itinerary"
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-green-500/10 px-5 py-2 text-sm font-semibold text-green-700 hover:bg-green-500/20"
                        >
                          <CheckCircle2 className="size-3.5" />
                          Added ✓ · View Itinerary
                          <ArrowRight className="size-3.5" />
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddToTrip(listing)}
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                        >
                          <Plus className="size-3.5" />
                          Add to trip
                        </button>
                      )}

                      {/* Details button */}
                      <button
                        type="button"
                        onClick={() => setDetailListing(listing)}
                        className="rounded-full border border-teal-navy/20 bg-card px-4 py-2 text-xs font-semibold text-teal-navy hover:bg-secondary"
                      >
                        Details
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Detail Dialog */}
      <AnimatePresence>
        {detailListing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDetailListing(null)}
              className="fixed inset-0 bg-teal-navy/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="listing-details-title"
              className="relative z-10 w-full max-w-lg rounded-3xl border border-border/80 bg-card p-6 shadow-2xl sm:p-8"
            >
              {/* Dialog Header */}
              <div className="flex items-start justify-between border-b border-border/50 pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-teal-navy">
                    {detailListing.category}
                  </span>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                    {detailListing.priceRange}
                  </span>
                  {detailListing.status === "live" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-green-700">
                      <CheckCircle2 className="size-3" />
                      Verified
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  aria-label="Close dialog"
                  onClick={() => setDetailListing(null)}
                  className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Dialog Body */}
              <div className="mt-4">
                <h2
                  id="listing-details-title"
                  className="font-serif text-2xl font-bold text-foreground"
                >
                  {detailListing.name}
                </h2>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="size-3.5 text-primary" />
                  {detailListing.area}
                </p>

                <p className="mt-4 text-sm leading-relaxed text-foreground/90">
                  {detailListing.description}
                </p>

                <div className="mt-5 rounded-2xl bg-secondary/60 p-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Average Spend</span>
                    <span className="font-serif text-base font-bold text-teal-navy">
                      ₹{detailListing.avgCost.toLocaleString("en-IN")} / person
                    </span>
                  </div>
                </div>

                {/* Interest Tags */}
                <div className="mt-4">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Categories &amp; Tags
                  </span>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {detailListing.interestTags.map((tag) => {
                      const obj = getInterestById(tag);
                      return (
                        <span
                          key={tag}
                          className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-teal-navy"
                        >
                          {obj ? obj.label : tag}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Dialog Actions */}
              <div className="mt-6 flex items-center justify-between gap-3 border-t border-border/50 pt-4">
                <button
                  type="button"
                  onClick={() => setDetailListing(null)}
                  className="rounded-full border border-teal-navy/20 bg-card px-4 py-2 text-xs font-semibold text-teal-navy hover:bg-secondary"
                >
                  Close
                </button>

                {!hasTrip ? (
                  <Link
                    href="/onboarding/trip-setup"
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                  >
                    <Plus className="size-3.5" />
                    Start a trip
                  </Link>
                ) : addedIds.has(detailListing.id) ? (
                  <Link
                    href="/trip/itinerary"
                    className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-5 py-2 text-sm font-semibold text-green-700 hover:bg-green-500/20"
                  >
                    <CheckCircle2 className="size-3.5" />
                    View Itinerary
                    <ArrowRight className="size-3.5" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleAddToTripFromDialog(detailListing)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                  >
                    <Plus className="size-3.5" />
                    Add to trip
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col bg-cream text-foreground">
          <Navbar />
          <main className="flex flex-1 items-center justify-center p-8">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-teal-navy text-primary-foreground">
                <Sparkles className="size-6 animate-pulse text-amber" />
              </div>
              <p className="font-serif text-xl font-medium text-teal-navy">
                Loading discover…
              </p>
            </div>
          </main>
          <Footer />
        </div>
      }
    >
      <DiscoverInner />
    </Suspense>
  );
}
