"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  Bookmark,
  Clock,
  Compass,
  MapPin,
  Moon,
  Sun,
  Sunrise,
} from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { useAuth } from "@/providers/AuthProvider";
import { getListingById } from "@/lib/listings";
import { getInterestById } from "@/data/interests";
import {
  type Trip,
  type TripSlot,
  getTripById,
  setCurrentTrip,
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

const SLOT_META: {
  slot: TripSlot;
  title: string;
  timeLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    slot: "morning",
    title: "Morning",
    timeLabel: "09:00 AM – 12:30 PM",
    icon: Sunrise,
  },
  {
    slot: "afternoon",
    title: "Afternoon",
    timeLabel: "01:00 PM – 05:00 PM",
    icon: Sun,
  },
  {
    slot: "evening",
    title: "Evening",
    timeLabel: "06:00 PM – 09:30 PM",
    icon: Moon,
  },
];

export default function TripDetailClient() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const id = typeof params.id === "string" ? params.id : "";

  const [trip, setTrip] = useState<Trip | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  useEffect(() => {
    if (!id) {
      queueMicrotask(() => setIsReady(true));
      return;
    }
    const found = getTripById(id);
    queueMicrotask(() => {
      setTrip(found);
      setIsReady(true);
    });
  }, [id]);

  if (!isReady) {
    return (
      <div className="flex min-h-screen flex-col bg-cream text-foreground">
        <Navbar />
        <main className="flex flex-1 items-center justify-center p-8">
          <p className="font-serif text-xl font-medium text-teal-navy">
            Loading trip...
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="flex min-h-screen flex-col bg-cream text-foreground">
        <Navbar />
        <main className="flex flex-1 items-center justify-center p-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Compass className="size-7" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-teal-navy">
              Trip not found
            </h1>
            <p className="text-sm text-muted-foreground">
              This trip doesn&apos;t exist or may have been deleted.
            </p>
            <Link
              href="/trips"
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
            >
              ← Back to My Trips
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const estimatedCost = estimateTripCost(trip);
  const budgetRatio = trip.budget > 0 ? estimatedCost / trip.budget : 0;
  const budgetPercentage = Math.round(budgetRatio * 100);
  const isOverBudget = budgetPercentage > 100;
  const isNearBudget = budgetPercentage >= 90 && !isOverBudget;

  const totalStops = trip.days.reduce((acc, day) => {
    return (
      acc +
      [day.morning, day.afternoon, day.evening].filter(Boolean).length
    );
  }, 0);

  const currentDay = trip.days[selectedDayIndex] || trip.days[0];

  return (
    <div className="flex min-h-screen flex-col bg-cream text-foreground">
      <Navbar />

      <main className="avero-gradient flex-1 pb-16 pt-8 sm:pb-24 sm:pt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Sign-up Banner */}
          {!user && (
            <div className="mb-6 flex flex-col items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/10 px-5 py-3 text-center sm:flex-row sm:text-left">
              <div className="flex items-center gap-2.5">
                <Bookmark className="size-4 shrink-0 text-primary" />
                <p className="text-xs font-medium text-teal-navy sm:text-sm">
                  Sign up to sync your trips across devices
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

          {/* Page Header */}
          <section className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-3.5 py-1 text-xs font-semibold text-teal-navy">
                <MapPin className="size-3.5 text-primary" />
                <span>{trip.destination}</span>
              </div>
              <h1 className="mt-2.5 font-serif text-3xl font-bold tracking-tight text-teal-navy sm:text-4xl lg:text-5xl">
                {trip.days.length} {trip.days.length === 1 ? "day" : "days"} in{" "}
                {trip.destination.split(",")[0] || trip.destination}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1">
                  {formatDateDisplay(trip.startDate)} –{" "}
                  {formatDateDisplay(trip.endDate)}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1">
                  {trip.travellers}{" "}
                  {trip.travellers === 1 ? "traveller" : "travellers"}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1">
                  ₹{trip.budget.toLocaleString("en-IN")} budget
                </span>
              </div>
            </div>
            <Link
              href="/trips"
              className="inline-flex items-center gap-1.5 rounded-full border border-teal-navy/20 bg-card px-4 py-2 text-xs font-semibold text-teal-navy shadow-xs transition-colors hover:bg-secondary sm:text-sm"
            >
              ← My Trips
            </Link>
          </section>

          {/* Two-Column Layout */}
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
            {/* Left Column: Day Tabs + Slot Cards (8 cols) */}
            <div className="lg:col-span-8">
              {/* Day Tabs */}
              <div className="no-scrollbar mb-4 flex items-center gap-2 overflow-x-auto pb-1">
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

              {/* Slot Cards */}
              <div className="mt-2 space-y-4">
                {SLOT_META.map((item) => {
                  const SlotIcon = item.icon;
                  const listingId =
                    currentDay?.[item.slot as keyof typeof currentDay] ?? null;
                  const listing =
                    typeof listingId === "string" && listingId
                      ? getListingById(listingId)
                      : null;

                  return (
                    <div
                      key={item.slot}
                      className="overflow-hidden rounded-3xl border border-border/80 bg-card p-6 shadow-xs"
                    >
                      {/* Slot Header */}
                      <div className="flex items-center gap-2.5 border-b border-border/50 pb-3">
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

                      {/* Slot Content */}
                      {listing ? (
                        <div className="mt-4">
                          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                            <div>
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
                            </div>
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
                        </div>
                      ) : (
                        /* Empty Slot: Free time (read-only, no Add button) */
                        <div className="mt-4 rounded-2xl border border-dashed border-border p-6 text-center">
                          <h3 className="font-serif text-lg font-semibold text-teal-navy">
                            Free time
                          </h3>
                          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                            Open slot for relaxation, spontaneous café visits,
                            or roaming the town.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Sticky Sidebar (4 cols) */}
            <aside className="lg:col-span-4">
              <div className="sticky top-24 space-y-6">
                {/* Budget Overview Card */}
                <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-border/50 pb-3">
                    <h2 className="font-serif text-lg font-semibold text-teal-navy">
                      Budget overview
                    </h2>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {trip.travellers}{" "}
                      {trip.travellers === 1 ? "person" : "people"}
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
                          isOverBudget ? "bg-destructive" : "bg-primary"
                        }`}
                        style={{ width: `${Math.min(100, budgetPercentage)}%` }}
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
                        <strong>Over budget:</strong> Total estimated stops
                        exceed your planned budget. Try editing the itinerary to
                        swap in lower-cost activities.
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

                {/* Trip Summary Card */}
                <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm">
                  <h2 className="border-b border-border/50 pb-3 font-serif text-lg font-semibold text-teal-navy">
                    Trip summary
                  </h2>

                  <div className="mt-4 space-y-3.5 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>Pace</span>
                      <span className="font-semibold text-foreground">
                        {trip.pace.charAt(0).toUpperCase() + trip.pace.slice(1)}{" "}
                        (
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
                        {totalStops} {totalStops === 1 ? "experience" : "experiences"}
                      </span>
                    </div>

                    {trip.interests.length > 0 && (
                      <div className="border-t border-border/50 pt-2">
                        <span className="mb-2 block font-medium text-foreground">
                          Interests
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
                    )}
                  </div>

                  {/* Edit in itinerary button */}
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentTrip(trip);
                        router.push("/trip/itinerary");
                      }}
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
                    >
                      Edit in itinerary
                    </button>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
