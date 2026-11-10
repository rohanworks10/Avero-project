"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Bookmark,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  List,
  MapPin,
  Moon,
  Plus,
  RefreshCw,
  Route,
  Sliders,
  Sparkles,
  Sun,
  Sunrise,
  Trash2,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { JourneyPath } from "@/components/ui/journey-path";
import { useWizard } from "@/providers/WizardProvider";
import { useAuth } from "@/providers/AuthProvider";
import { getListingById, type Listing } from "@/lib/listings";
import { getInterestById } from "@/data/interests";
import {
  type Trip,
  type TripSlot,
  createTripFromWizard,
  getCurrentTrip,
  removeListingFromTrip,
  saveCurrentTrip,
  addListingToTrip,
  estimateTripCost,
} from "@/lib/trips-store";

function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return dateStr;
  const [year, month, day] = parts;
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ItineraryPage() {
  const router = useRouter();
  const { data: wizardData } = useWizard();
  const { user } = useAuth();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"list" | "journey">("list");
  const [saveToast, setSaveToast] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [activeDetailListing, setActiveDetailListing] = useState<Listing | null>(
    null
  );

  // Initialize or restore trip on mount
  useEffect(() => {
    const existing = getCurrentTrip();

    if (existing) {
      queueMicrotask(() => {
        setTrip(existing);
        setIsReady(true);
      });
      return;
    }

    // If no existing trip, check if wizard state is complete
    const hasDates = Boolean(wizardData.startDate && wizardData.endDate);
    const hasInterests = Boolean(
      wizardData.interests && wizardData.interests.length > 0
    );

    if (!hasDates || !hasInterests) {
      // Incomplete wizard state -> redirect to wizard
      router.replace("/onboarding/trip-setup");
      return;
    }

    // First visit with complete wizard state -> create trip
    const created = createTripFromWizard(wizardData);
    queueMicrotask(() => {
      setTrip(created);
      setIsReady(true);
    });
  }, [wizardData, router]);

  function handleRemoveListing(listingId: string) {
    const updated = removeListingFromTrip(listingId);
    if (updated) {
      setTrip(updated);
    }
  }

  function handleAddListing(
    listingId: string,
    dayNumber: number,
    slot: TripSlot
  ) {
    const updated = addListingToTrip(listingId, dayNumber, slot);
    if (updated) {
      setTrip(updated);
    }
  }

  function handleSaveTrip() {
    if (!trip) return;
    saveCurrentTrip();
    setSaveToast(true);
    setTimeout(() => {
      setSaveToast(false);
    }, 4500);
  }

  function handleRegenerate() {
    setIsRegenerating(true);
    setTimeout(() => {
      const regenerated = createTripFromWizard(wizardData);
      setTrip(regenerated);
      setIsRegenerating(false);
      setSelectedDayIndex(0);
    }, 1200);
  }

  if (!isReady || !trip) {
    return (
      <div className="flex min-h-screen flex-col bg-cream text-foreground">
        <Navbar />
        <main className="flex flex-1 items-center justify-center p-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-teal-navy text-primary-foreground">
              <Sparkles className="size-6 animate-pulse text-amber" />
            </div>
            <p className="font-serif text-xl font-medium text-teal-navy">
              Loading your itinerary...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Check if any slot has any live listing
  const totalAssignedStops = trip.days.reduce((acc, day) => {
    const count = [day.morning, day.afternoon, day.evening].filter(Boolean)
      .length;
    return acc + count;
  }, 0);

  const estimatedCost = estimateTripCost(trip);
  const budgetRatio = trip.budget > 0 ? estimatedCost / trip.budget : 0;
  const budgetPercentage = Math.round(budgetRatio * 100);
  const isOverBudget = budgetPercentage > 100;
  const isNearBudget = budgetPercentage >= 90 && !isOverBudget;

  const currentDay = trip.days[selectedDayIndex] || trip.days[0];

  const slotsData: {
    slot: TripSlot;
    title: string;
    timeLabel: string;
    icon: React.ComponentType<{ className?: string }>;
    listingId: string | null;
  }[] = [
    {
      slot: "morning",
      title: "Morning",
      timeLabel: "09:00 AM – 12:30 PM",
      icon: Sunrise,
      listingId: currentDay?.morning ?? null,
    },
    {
      slot: "afternoon",
      title: "Afternoon",
      timeLabel: "01:00 PM – 05:00 PM",
      icon: Sun,
      listingId: currentDay?.afternoon ?? null,
    },
    {
      slot: "evening",
      title: "Evening",
      timeLabel: "06:00 PM – 09:30 PM",
      icon: Moon,
      listingId: currentDay?.evening ?? null,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-cream text-foreground">
      <Navbar />

      <main className="avero-gradient flex-1 pb-16 pt-8 sm:pb-24 sm:pt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Unregistered User Cloud Sync Banner */}
          {!user && (
            <div className="mb-6 flex flex-col items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/10 px-5 py-3 text-center sm:flex-row sm:text-left">
              <div className="flex items-center gap-2.5">
                <Bookmark className="size-4 shrink-0 text-primary" />
                <p className="text-xs font-medium text-teal-navy sm:text-sm">
                  Sign up to keep your trips on any device and access them on the go.
                </p>
              </div>
              <Link
                href="/signup"
                className="shrink-0 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
              >
                Sign up
              </Link>
            </div>
          )}

          {/* Toast Notification */}
          <AnimatePresence>
            {saveToast && (
              <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-teal-navy/20 bg-teal-navy px-5 py-3.5 text-primary-foreground shadow-xl"
              >
                <CheckCircle2 className="size-5 text-amber" />
                <div className="text-xs sm:text-sm">
                  <p className="font-semibold">Trip saved successfully!</p>
                  <p className="text-primary-foreground/80">
                    Saved to your browser storage.{" "}
                    <Link
                      href="/trips"
                      className="underline underline-offset-2 hover:text-amber"
                    >
                      View in My Trips &rarr;
                    </Link>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header Section */}
          <section className="mb-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3.5 py-1 text-xs font-semibold text-teal-navy">
                <MapPin className="size-3.5 text-primary" />
                <span>{trip.destination}</span>
              </div>

              <h1 className="mt-2.5 font-serif text-3xl font-bold tracking-tight text-teal-navy sm:text-4xl lg:text-5xl">
                Your {trip.days.length} {trip.days.length === 1 ? "day" : "days"} in{" "}
                {trip.destination.split(",")[0] || trip.destination}
              </h1>

              {/* Preference Chips */}
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1">
                  <Calendar className="size-3.5 text-teal-navy" />
                  <span>
                    {formatDateDisplay(trip.startDate)} –{" "}
                    {formatDateDisplay(trip.endDate)}
                  </span>
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1">
                  <Users className="size-3.5 text-teal-navy" />
                  <span>
                    {trip.travellers}{" "}
                    {trip.travellers === 1 ? "Traveller" : "Travellers"}
                  </span>
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1">
                  <Wallet className="size-3.5 text-teal-navy" />
                  <span>₹{trip.budget.toLocaleString("en-IN")} Budget</span>
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1">
                  <Compass className="size-3.5 text-teal-navy" />
                  <span>
                    {trip.pace.charAt(0).toUpperCase() + trip.pace.slice(1)} Pace
                  </span>
                </span>
              </div>
            </div>

            {/* Edit Preferences Link */}
            <Link
              href="/onboarding/trip-setup"
              className="inline-flex items-center gap-1.5 rounded-full border border-teal-navy/20 bg-card px-4 py-2 text-xs font-semibold text-teal-navy shadow-xs transition-colors hover:bg-secondary sm:text-sm"
            >
              <Sliders className="size-3.5" />
              <span>Edit preferences</span>
            </Link>
          </section>

          {/* Empty State when no live listings match */}
          {totalAssignedStops === 0 ? (
            <div className="rounded-3xl border border-border/80 bg-card p-10 text-center shadow-md">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber/20 text-teal-navy">
                <Compass className="size-7" />
              </div>
              <h2 className="mt-4 font-serif text-2xl font-semibold text-teal-navy">
                No matching places found
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                We couldn&apos;t find verified listings matching your exact
                combination of interests and budget. Try loosening your filters or
                choosing more interests.
              </p>
              <div className="mt-6">
                <Link
                  href="/onboarding/trip-setup"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                >
                  <span>Adjust preferences</span>
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          ) : (
            /* Two Column Layout on Desktop */
            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
              {/* Left Column: Itinerary & Day Tabs (8 cols) */}
              <div className="lg:col-span-8">
                {/* Day Tabs & View Toggle Row */}
                <div className="mb-4 flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
                  {/* Day Tabs */}
                  <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
                    {trip.days.map((day, idx) => {
                      const isSelected = selectedDayIndex === idx;
                      return (
                        <button
                          key={day.dayNumber}
                          type="button"
                          onClick={() => setSelectedDayIndex(idx)}
                          className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all sm:text-sm ${
                            isSelected
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "border border-border bg-card text-foreground hover:bg-secondary"
                          }`}
                        >
                          <span className="font-semibold">Day {day.dayNumber}</span>
                          {day.date && (
                            <span
                              className={`text-[11px] ${
                                isSelected
                                  ? "text-primary-foreground/80"
                                  : "text-muted-foreground"
                              }`}
                            >
                              • {formatDateDisplay(day.date)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* List / Journey View Toggle */}
                  <div
                    role="group"
                    aria-label="Itinerary view mode"
                    className="inline-flex shrink-0 items-center self-start rounded-full border border-border/70 bg-secondary p-1 sm:self-auto"
                  >
                    <button
                      type="button"
                      onClick={() => setViewMode("list")}
                      aria-pressed={viewMode === "list"}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                        viewMode === "list"
                          ? "bg-card text-primary shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <List className="size-3.5" />
                      <span>List view</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("journey")}
                      aria-pressed={viewMode === "journey"}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                        viewMode === "journey"
                          ? "bg-card text-primary shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Route className="size-3.5" />
                      <span>Journey view</span>
                    </button>
                  </div>
                </div>

                {/* Day Content Container with Regenerating Animation */}
                <div className="relative mt-2">
                  <AnimatePresence mode="wait">
                    {isRegenerating ? (
                      <motion.div
                        key="regenerating"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="flex h-96 flex-col items-center justify-center rounded-3xl border border-border/80 bg-card p-8 text-center shadow-sm"
                      >
                        <RefreshCw className="size-10 animate-spin text-primary" />
                        <h2 className="mt-4 font-serif text-xl font-semibold text-teal-navy">
                          Rebuilding your plan...
                        </h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Sequencing morning, afternoon, and evening stops.
                        </p>
                      </motion.div>
                    ) : viewMode === "journey" ? (
                      /* Journey View (winding path with stops & nearby stores) */
                      <motion.div
                        key={`journey-${selectedDayIndex}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <JourneyPath
                          dayNumber={currentDay.dayNumber}
                          date={currentDay.date}
                          slots={slotsData}
                          trip={trip}
                          onSelectListing={(listing) =>
                            setActiveDetailListing(listing)
                          }
                          onAddListing={handleAddListing}
                        />
                      </motion.div>
                    ) : (
                      /* List View (Original vertical timeline) */
                      <motion.div
                        key={`list-${selectedDayIndex}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        {slotsData.map((item) => {
                          const SlotIcon = item.icon;
                          const listing = item.listingId
                            ? getListingById(item.listingId)
                            : null;

                          return (
                            <div
                              key={item.slot}
                              className="relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 shadow-xs transition-all hover:border-primary/40 hover:shadow-sm"
                            >
                              {/* Slot Header */}
                              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="flex size-8 items-center justify-center rounded-xl bg-secondary text-teal-navy">
                                    <SlotIcon className="size-4" />
                                  </div>
                                  <div>
                                    <h2 className="text-sm font-semibold uppercase tracking-wider text-teal-navy">
                                      {item.title}
                                    </h2>
                                    <span className="text-xs text-muted-foreground">
                                      {item.timeLabel}
                                    </span>
                                  </div>
                                </div>

                                {listing && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveListing(listing.id)
                                    }
                                    className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
                                    title="Remove from itinerary"
                                  >
                                    <Trash2 className="size-3.5" />
                                    <span>Remove</span>
                                  </button>
                                )}
                              </div>

                              {/* Slot Content */}
                              {listing ? (
                                <div className="mt-4">
                                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setActiveDetailListing(listing)
                                      }
                                      className="text-left transition-colors hover:text-primary"
                                    >
                                      <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="font-serif text-xl font-bold text-foreground">
                                          {listing.name}
                                        </h3>
                                        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-primary">
                                          {listing.priceRange}
                                        </span>
                                      </div>

                                      <p className="mt-1 text-xs text-muted-foreground">
                                        {listing.category} • {listing.area}
                                      </p>
                                    </button>

                                    <div className="text-left sm:text-right">
                                      <span className="font-serif text-lg font-bold text-teal-navy">
                                        ₹{listing.avgCost.toLocaleString("en-IN")}
                                      </span>
                                      <p className="text-[11px] text-muted-foreground">
                                        avg / person
                                      </p>
                                    </div>
                                  </div>

                                  <p className="mt-3 text-xs leading-relaxed text-foreground/90 sm:text-sm">
                                    {listing.description}
                                  </p>

                                  {/* Interest Tags */}
                                  <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
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

                                  {/* Why this match line */}
                                  {(() => {
                                    const overlapping =
                                      listing.interestTags.filter((t) =>
                                        trip.interests.includes(t)
                                      );
                                    const overlapLabels = overlapping.map(
                                      (t) => getInterestById(t)?.label || t
                                    );

                                    return (
                                      <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 px-3.5 py-2 text-xs text-teal-navy">
                                        <span className="font-semibold text-primary">
                                          Why this match:{" "}
                                        </span>
                                        {overlapLabels.length > 0
                                          ? `Matches your interest in ${overlapLabels.join(", ")}.`
                                          : `Handpicked highlight curated for your ${trip.pace} rhythm.`}
                                      </div>
                                    );
                                  })()}
                                </div>
                              ) : (
                                /* Empty Slot: Free time */
                                <div className="mt-4 flex flex-col items-center justify-between gap-4 rounded-2xl border border-dashed border-border p-6 text-center sm:flex-row sm:text-left">
                                  <div>
                                    <h3 className="font-serif text-lg font-semibold text-teal-navy">
                                      Free time
                                    </h3>
                                    <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                                      Open slot for relaxation, spontaneous cafe visits,
                                      or roaming the town.
                                    </p>
                                  </div>

                                  <Link
                                    href="/discover"
                                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-primary/30 bg-card px-4 py-2 text-xs font-semibold text-primary shadow-2xs transition-colors hover:bg-primary hover:text-primary-foreground"
                                  >
                                    <Plus className="size-3.5" />
                                    <span>Add a place</span>
                                  </Link>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Right Column: Sticky Summary Sidebar (4 cols) */}
              <aside className="lg:col-span-4">
                <div className="sticky top-24 space-y-6">
                  {/* Budget Card */}
                  <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm">
                    <div className="flex items-center justify-between border-b border-border/50 pb-3">
                      <h2 className="font-serif text-lg font-semibold text-teal-navy">
                        Budget overview
                      </h2>
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {trip.travellers} {trip.travellers === 1 ? "person" : "people"}
                      </span>
                    </div>

                    <div className="mt-4 space-y-1">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-muted-foreground">
                          Estimated Cost
                        </span>
                        <span className="font-serif text-2xl font-bold text-teal-navy">
                          ₹{estimatedCost.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Target Budget</span>
                        <span>₹{trip.budget.toLocaleString("en-IN")}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isOverBudget
                              ? "bg-destructive"
                              : isNearBudget
                              ? "bg-amber"
                              : "bg-primary"
                          }`}
                          style={{
                            width: `${Math.min(100, budgetPercentage)}%`,
                          }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs font-medium">
                        <span
                          className={
                            isOverBudget
                              ? "text-destructive"
                              : isNearBudget
                              ? "text-amber"
                              : "text-primary"
                          }
                        >
                          {budgetPercentage}% used
                        </span>
                        <span className="text-muted-foreground">
                          {isOverBudget
                            ? `Exceeded by ₹${(estimatedCost - trip.budget).toLocaleString("en-IN")}`
                            : `₹${Math.max(0, trip.budget - estimatedCost).toLocaleString("en-IN")} remaining`}
                        </span>
                      </div>
                    </div>

                    {/* Over-budget Warning */}
                    {isOverBudget && (
                      <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                        <AlertTriangle className="size-4 shrink-0" />
                        <p>
                          <strong>Over budget:</strong> Total estimated stops exceed your
                          planned budget. Try removing premium activities or replacing
                          them with free heritage walks.
                        </p>
                      </div>
                    )}

                    {/* Near-budget Advisory */}
                    {isNearBudget && (
                      <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-amber/30 bg-amber/10 p-3 text-xs text-teal-navy">
                        <Clock className="size-4 shrink-0 text-amber" />
                        <p>
                          <strong>Approaching limit:</strong> You have used{" "}
                          {budgetPercentage}% of your budget.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Trip Details Card */}
                  <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm">
                    <h2 className="font-serif text-lg font-semibold text-teal-navy border-b border-border/50 pb-3">
                      Trip summary
                    </h2>

                    <div className="mt-4 space-y-3.5 text-xs text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span>Pace</span>
                        <span className="font-semibold text-foreground">
                          {trip.pace.charAt(0).toUpperCase() + trip.pace.slice(1)} (
                          {trip.pace === "relaxed"
                            ? "2 stops/day"
                            : trip.pace === "packed"
                            ? "4 stops/day"
                            : "3 stops/day"}
                          )
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span>Scheduled Stops</span>
                        <span className="font-semibold text-foreground">
                          {totalAssignedStops} experiences
                        </span>
                      </div>

                      <div className="pt-2 border-t border-border/50">
                        <span className="block mb-2 font-medium text-foreground">
                          Matching Interests
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {trip.interests.map((tag) => {
                            const obj = getInterestById(tag);
                            return (
                              <span
                                key={tag}
                                className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-teal-navy"
                              >
                                {obj ? obj.label : tag}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex flex-col gap-2.5">
                      <button
                        type="button"
                        onClick={handleSaveTrip}
                        className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      >
                        <Bookmark className="size-4" />
                        <span>Save trip</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleRegenerate}
                        disabled={isRegenerating}
                        className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-teal-navy/20 bg-card text-sm font-semibold text-teal-navy transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <RefreshCw
                          className={`size-4 ${isRegenerating ? "animate-spin" : ""}`}
                        />
                        <span>Regenerate plan</span>
                      </button>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>

      {/* Stop Details Dialog / Modal */}
      <AnimatePresence>
        {activeDetailListing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveDetailListing(null)}
              className="fixed inset-0 bg-teal-navy/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative z-10 w-full max-w-lg rounded-3xl border border-border/80 bg-card p-6 shadow-2xl sm:p-8"
            >
              <div className="flex items-start justify-between border-b border-border/50 pb-4">
                <div>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-teal-navy">
                    {activeDetailListing.category}
                  </span>
                  <span className="ml-2 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                    {activeDetailListing.priceRange}
                  </span>
                </div>

                <button
                  type="button"
                  aria-label="Close dialog"
                  onClick={() => setActiveDetailListing(null)}
                  className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="mt-4">
                <h2 className="font-serif text-2xl font-bold text-foreground">
                  {activeDetailListing.name}
                </h2>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="size-3.5 text-primary" />
                  <span>{activeDetailListing.area}</span>
                </p>

                <p className="mt-4 text-sm leading-relaxed text-foreground/90">
                  {activeDetailListing.description}
                </p>

                <div className="mt-5 rounded-2xl bg-secondary/60 p-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Average Spend</span>
                    <span className="font-serif text-base font-bold text-teal-navy">
                      ₹{activeDetailListing.avgCost.toLocaleString("en-IN")} / person
                    </span>
                  </div>
                </div>

                {/* Interest Tags */}
                <div className="mt-4">
                  <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Categories & Tags
                  </span>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {activeDetailListing.interestTags.map((tag) => {
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
              <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    handleRemoveListing(activeDetailListing.id);
                    setActiveDetailListing(null);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 px-4 py-2 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10"
                >
                  <Trash2 className="size-3.5" />
                  <span>Remove from trip</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveDetailListing(null)}
                  className="rounded-full bg-secondary px-5 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-secondary/80"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
