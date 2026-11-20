"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock,
  Compass,
  IndianRupee,
  Landmark,
  MapPin,
  Palette,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Sun,
  Timer,
  Trees,
  Utensils,
  Wine,
  X,
} from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { useWizard } from "@/providers/WizardProvider";
import { interests, getInterestById } from "@/data/interests";
import {
  getCurrentTrip,
  addListingToTrip,
  type TripSlot,
} from "@/lib/trips-store";
import {
  DESTINATIONS,
  destinations,
  getPlacesByDestination,
  searchPlaces,
  type Destination,
  type Place,
} from "@/lib/places-data";

// ─── constants ──────────────────────────────────────────────────────────────

const INTEREST_ICON_MAP: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  Utensils,
  Landmark,
  Trees,
  Compass,
  ShoppingBag,
  Wine,
  Sparkles,
  Palette,
};

const PRICE_LEVELS = [1, 2, 3] as const;
type PriceLevel = (typeof PRICE_LEVELS)[number];
const PRICE_LABEL: Record<PriceLevel, string> = { 1: "₹", 2: "₹₹", 3: "₹₹₹" };

// ─── helpers ────────────────────────────────────────────────────────────────

/** Extract bare city name from wizard destination string like "Belagavi, Karnataka" */
function extractCity(raw: string): string {
  return raw.split(",")[0].trim();
}

/** Find the best-matching DESTINATIONS entry for a wizard destination string. */
function matchDestination(raw: string): Destination {
  const city = extractCity(raw).toLowerCase();
  const found = DESTINATIONS.find((d) => d.toLowerCase() === city);
  return found ?? "Belagavi";
}

// ─── destination combobox ───────────────────────────────────────────────────

function DestinationSelector({
  value,
  onChange,
}: {
  value: Destination;
  onChange: (d: Destination) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return q ? destinations.filter((d) => d.toLowerCase().includes(q)) : destinations;
  }, [query]);

  // close on outside click
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative inline-block" ref={panelRef}>
      <button
        type="button"
        onClick={() => {
          setOpen((prev) => !prev);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary hover:bg-primary/15 focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        {value}
        <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-lg"
          >
            {/* search within dropdown */}
            <div className="border-b border-border/60 p-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search destinations…"
                  className="w-full rounded-lg bg-secondary/70 py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                />
              </div>
            </div>
            <ul className="max-h-52 overflow-y-auto py-1" role="listbox">
              {filtered.map((dest) => (
                <li key={dest}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={dest === value}
                    onClick={() => {
                      onChange(dest);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={`flex w-full items-center gap-2 px-4 py-2 text-sm transition-colors ${
                      dest === value
                        ? "bg-primary/10 font-semibold text-primary"
                        : "text-foreground hover:bg-secondary"
                    }`}
                  >
                    <MapPin className="size-3.5 shrink-0 text-primary/70" />
                    {dest}
                  </button>
                </li>
              ))}
              {filtered.length === 0 && (
                <li className="px-4 py-3 text-center text-xs text-muted-foreground">
                  No matching destinations
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── place card ─────────────────────────────────────────────────────────────

function PlaceCard({
  place,
  isAdded,
  hasTrip,
  onAdd,
  onDetails,
}: {
  place: Place;
  isAdded: boolean;
  hasTrip: boolean;
  onAdd: (p: Place) => void;
  onDetails: (p: Place) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="relative flex flex-col overflow-hidden rounded-3xl border border-border/80 bg-card p-6 shadow-xs transition-shadow hover:shadow-sm"
    >
      {/* Top: category + verified */}
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-secondary px-3 py-0.5 text-xs font-semibold text-teal-navy">
          {place.category}
        </span>
        {place.verified && (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-green-700">
            <CheckCircle2 className="size-3" />
            Verified
          </span>
        )}
      </div>

      {/* Name + price */}
      <div className="mt-3 flex items-start justify-between gap-2">
        <h2 className="font-serif text-xl font-bold leading-tight text-foreground">
          {place.name}
        </h2>
        <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
          {PRICE_LABEL[place.priceLevel]}
        </span>
      </div>

      {/* Area */}
      <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
        <MapPin className="size-3.5 shrink-0 text-primary" />
        {place.area}
      </p>

      {/* Avg cost */}
      <p className="mt-1 text-xs text-muted-foreground">
        Avg cost:{" "}
        <span className="font-semibold text-teal-navy">
          ₹{place.avgCost.toLocaleString("en-IN")}
          <span className="font-normal text-muted-foreground"> / person</span>
        </span>
      </p>

      {/* Description */}
      <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-foreground/80 sm:text-sm">
        {place.shortDescription}
      </p>

      {/* Interest chips */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {place.interests.map((tag) => {
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
            onClick={() => onAdd(place)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            <Plus className="size-3.5" />
            Add to trip
          </button>
        )}

        <button
          type="button"
          onClick={() => onDetails(place)}
          className="rounded-full border border-teal-navy/20 bg-card px-4 py-2 text-xs font-semibold text-teal-navy hover:bg-secondary"
        >
          Details
        </button>
      </div>
    </motion.div>
  );
}

// ─── detail modal ───────────────────────────────────────────────────────────

function DetailModal({
  place,
  isAdded,
  hasTrip,
  onAdd,
  onClose,
}: {
  place: Place;
  isAdded: boolean;
  hasTrip: boolean;
  onAdd: (p: Place) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-teal-navy/40 backdrop-blur-xs"
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="place-detail-title"
        className="relative z-10 w-full max-w-lg overflow-y-auto rounded-3xl border border-border/80 bg-card p-6 shadow-2xl sm:p-8 max-h-[90dvh]"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border/50 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-teal-navy">
              {place.category}
            </span>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
              {PRICE_LABEL[place.priceLevel]}
            </span>
            {place.verified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-green-700">
                <CheckCircle2 className="size-3" />
                Verified
              </span>
            )}
          </div>
          <button
            type="button"
            aria-label="Close details"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="mt-4 space-y-4">
          <div>
            <h2
              id="place-detail-title"
              className="font-serif text-2xl font-bold text-foreground"
            >
              {place.name}
            </h2>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3.5 text-primary" />
              {place.area}
            </p>
          </div>

          <p className="text-sm leading-relaxed text-foreground/90">
            {place.shortDescription}
          </p>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 rounded-2xl bg-secondary/60 p-4 text-xs">
            <div className="flex items-start gap-2">
              <IndianRupee className="mt-0.5 size-3.5 shrink-0 text-primary" />
              <div>
                <p className="text-muted-foreground">Avg spend</p>
                <p className="font-semibold text-teal-navy">
                  ₹{place.avgCost.toLocaleString("en-IN")} / person
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Timer className="mt-0.5 size-3.5 shrink-0 text-primary" />
              <div>
                <p className="text-muted-foreground">Typical duration</p>
                <p className="font-semibold text-teal-navy">{place.duration}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock className="mt-0.5 size-3.5 shrink-0 text-primary" />
              <div>
                <p className="text-muted-foreground">Opening hours</p>
                <p className="font-semibold text-teal-navy">{place.openingHours}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Sun className="mt-0.5 size-3.5 shrink-0 text-primary" />
              <div>
                <p className="text-muted-foreground">Best time to visit</p>
                <p className="font-semibold text-teal-navy">{place.bestTime}</p>
              </div>
            </div>
          </div>

          {/* Interest tags */}
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Categories &amp; Tags
            </span>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {place.interests.map((tag) => {
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

        {/* Actions */}
        <div className="mt-6 flex items-center justify-between gap-3 border-t border-border/50 pt-4">
          <button
            type="button"
            onClick={onClose}
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
          ) : isAdded ? (
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
              onClick={() => onAdd(place)}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              <Plus className="size-3.5" />
              Add to trip
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── main inner component ───────────────────────────────────────────────────

function DiscoverInner() {
  const searchParams = useSearchParams();
  const { data: wizardData } = useWizard();

  // Parse URL params for slot-based adding (from itinerary → discover flow)
  const dayParam = useMemo(() => {
    const d = searchParams.get("day");
    if (!d || !/^\d+$/.test(d)) return undefined;
    const day = Number(d);
    return Number.isSafeInteger(day) && day > 0 ? day : undefined;
  }, [searchParams]);

  const slotParam = useMemo(() => {
    const s = searchParams.get("slot");
    if (s === "morning" || s === "afternoon" || s === "evening")
      return s as TripSlot;
    return undefined;
  }, [searchParams]);

  // ── destination state ──
  const [selectedDest, setSelectedDest] = useState<Destination>(() =>
    matchDestination(wizardData.destination)
  );

  // Keep in sync if wizard changes (e.g. user came from setup)
  useEffect(() => {
    queueMicrotask(() => {
      setSelectedDest(matchDestination(wizardData.destination));
    });
  }, [wizardData.destination]);

  // ── filter state ──
  const [search, setSearch] = useState("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedPriceLevels, setSelectedPriceLevels] = useState<PriceLevel[]>([]);
  const [sortSelection, setSortSelection] = useState<
    "best" | "price-asc" | "price-desc" | null
  >(null);

  // ── UI state ──
  const [hasTrip, setHasTrip] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [detailPlace, setDetailPlace] = useState<Place | null>(null);

  // Check for active trip on mount (and when dest changes to re-check)
  useEffect(() => {
    queueMicrotask(() => {
      setHasTrip(getCurrentTrip() !== null);
    });
  }, [selectedDest]);

  // ── derived sort ──
  const sortBy =
    sortSelection === "best" && wizardData.interests.length === 0
      ? "price-asc"
      : (sortSelection ??
          (wizardData.interests.length > 0 ? "best" : "price-asc"));

  // ── filtered + sorted places ──
  const filtered = useMemo(() => {
    // Start from destination-scoped places; use searchPlaces when query given
    let result: Place[] = search.trim()
      ? searchPlaces(selectedDest, search.trim())
      : getPlacesByDestination(selectedDest);

    // Interest filter
    if (selectedInterests.length > 0) {
      result = result.filter((p) =>
        p.interests.some((tag) => selectedInterests.includes(tag))
      );
    }

    // Price level filter
    if (selectedPriceLevels.length > 0) {
      result = result.filter((p) =>
        selectedPriceLevels.includes(p.priceLevel)
      );
    }

    // Sort
    if (sortBy === "best") {
      result = result.slice().sort((a, b) => {
        const aCount = a.interests.filter((t) =>
          wizardData.interests.includes(t)
        ).length;
        const bCount = b.interests.filter((t) =>
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
  }, [
    selectedDest,
    search,
    selectedInterests,
    selectedPriceLevels,
    sortBy,
    wizardData.interests,
  ]);

  // ── actions ──
  function resetFilters() {
    setSearch("");
    setSelectedInterests([]);
    setSelectedPriceLevels([]);
    setSortSelection(null);
  }

  function toggleInterest(id: string) {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function togglePriceLevel(lvl: PriceLevel) {
    setSelectedPriceLevels((prev) =>
      prev.includes(lvl) ? prev.filter((x) => x !== lvl) : [...prev, lvl]
    );
  }

  function handleAddToTrip(place: Place) {
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

    const updatedTrip = addListingToTrip(place.id, dayParam, slotParam);
    if (!updatedTrip) {
      setHasTrip(false);
      return;
    }
    setHasTrip(true);
    setAddedIds((prev) => new Set([...prev, place.id]));
  }

  function handleAddFromModal(place: Place) {
    handleAddToTrip(place);
    setDetailPlace(null);
  }

  const sortOptions: {
    label: string;
    value: "best" | "price-asc" | "price-desc";
  }[] = [
    ...(wizardData.interests.length > 0
      ? [
          {
            label: "Best match to my interests",
            value: "best" as const,
          },
        ]
      : []),
    { label: "Price: low to high", value: "price-asc" as const },
    { label: "Price: high to low", value: "price-desc" as const },
  ];

  const hasActiveFilters =
    search.trim().length > 0 ||
    selectedInterests.length > 0 ||
    selectedPriceLevels.length > 0;

  // ── render ──
  return (
    <div className="flex min-h-screen flex-col bg-cream text-foreground">
      <Navbar />

      <main className="avero-gradient flex-1 pb-16 pt-8 sm:pb-24 sm:pt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* ── Header ── */}
          <section className="mb-8 sm:mb-10">
            {/* Slot context banner */}
            {dayParam !== undefined && slotParam !== undefined && (
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
                <Plus className="size-3.5" />
                <span>
                  Adding to Day {dayParam} ·{" "}
                  {slotParam.charAt(0).toUpperCase() + slotParam.slice(1)}
                </span>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="font-serif text-3xl font-bold tracking-tight text-teal-navy sm:text-4xl lg:text-5xl">
                  Discover local{" "}
                  <span className="text-primary">{selectedDest}</span>
                </h1>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
                  Find authentic experiences, local gems, and hidden stops for
                  your {selectedDest} trip.
                </p>
              </div>

              {/* Destination selector */}
              <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Destination
                </span>
                <DestinationSelector
                  value={selectedDest}
                  onChange={(d) => {
                    setSelectedDest(d);
                    resetFilters();
                  }}
                />
              </div>
            </div>
          </section>

          {/* ── Filters bar ── */}
          <section className="mb-8 space-y-4 rounded-3xl border border-border/80 bg-card p-5 shadow-xs sm:p-6">
            {/* Search + Sort */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Search places in ${selectedDest}…`}
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

            {/* Price + Clear */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Price
                </span>
                {PRICE_LEVELS.map((lvl) => {
                  const isActive = selectedPriceLevels.includes(lvl);
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => togglePriceLevel(lvl)}
                      className={`rounded-full px-3.5 py-1 text-xs font-bold transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary/80 text-teal-navy hover:bg-secondary"
                      }`}
                    >
                      {PRICE_LABEL[lvl]}
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

          {/* ── Results count ── */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filtered.length}{" "}
              {filtered.length === 1 ? "place" : "places"} found in{" "}
              <span className="font-semibold text-teal-navy">{selectedDest}</span>
            </p>
          </div>

          {/* ── Grid or empty state ── */}
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
                No places match your search
              </h2>
              <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
                Try different interests, adjust your price filter, or{" "}
                <button
                  type="button"
                  onClick={resetFilters}
                  className="font-semibold text-primary underline-offset-2 hover:underline"
                >
                  clear all filters
                </button>
                .
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
              {filtered.map((place) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  isAdded={addedIds.has(place.id)}
                  hasTrip={hasTrip}
                  onAdd={handleAddToTrip}
                  onDetails={setDetailPlace}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ── Detail modal ── */}
      <AnimatePresence>
        {detailPlace && (
          <DetailModal
            place={detailPlace}
            isAdded={addedIds.has(detailPlace.id)}
            hasTrip={hasTrip}
            onAdd={handleAddFromModal}
            onClose={() => setDetailPlace(null)}
          />
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

// ─── page export ─────────────────────────────────────────────────────────────

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
