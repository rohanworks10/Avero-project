"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Bookmark,
  Calendar,
  MapPin,
  Trash2,
  Users,
  Wallet,
} from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { useAuth } from "@/providers/AuthProvider";
import {
  type Trip,
  getSavedTrips,
  deleteSavedTrip,
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

function countStops(trip: Trip): number {
  return trip.days.reduce((acc, day) => {
    return (
      acc +
      [day.morning, day.afternoon, day.evening].filter(Boolean).length
    );
  }, 0);
}

export default function TripsPage() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setTrips(getSavedTrips());
      setIsReady(true);
    });
  }, []);

  function handleDelete(tripId: string) {
    deleteSavedTrip(tripId);
    setTrips(getSavedTrips());
  }

  if (!isReady) {
    return (
      <div className="flex min-h-screen flex-col bg-cream text-foreground">
        <Navbar />
        <main className="flex flex-1 items-center justify-center p-8">
          <p className="font-serif text-xl font-medium text-teal-navy">
            Loading your trips...
          </p>
        </main>
        <Footer />
      </div>
    );
  }

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
          <section className="mb-8">
            <h1 className="font-serif text-3xl font-bold tracking-tight text-teal-navy sm:text-4xl lg:text-5xl">
              My Trips
            </h1>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              All your saved Belagavi itineraries in one place.
            </p>
          </section>

          {/* Empty State */}
          {trips.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-border/80 bg-card p-16 text-center shadow-xs">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <MapPin className="size-7" />
              </div>
              <h2 className="mt-5 font-serif text-2xl font-semibold text-teal-navy">
                No trips saved yet
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                Start planning your first Belagavi adventure.
              </p>
              <Link
                href="/onboarding/trip-setup"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                Plan my first trip →
              </Link>
            </div>
          ) : (
            /* Trip Cards Grid */
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {trips.map((trip) => {
                const estimatedCost = estimateTripCost(trip);
                const budgetRatio =
                  trip.budget > 0 ? estimatedCost / trip.budget : 0;
                const budgetPercentage = Math.min(
                  100,
                  Math.round(budgetRatio * 100)
                );
                const isOverBudget = estimatedCost > trip.budget;
                const stops = countStops(trip);

                return (
                  <div
                    key={trip.id}
                    className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs transition-all hover:shadow-sm"
                  >
                    {/* Destination */}
                    <h2 className="font-serif text-lg font-semibold text-teal-navy">
                      {trip.destination}
                    </h2>

                    {/* Dates */}
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="size-3.5 text-teal-navy" />
                      <span>
                        {formatDateDisplay(trip.startDate)} –{" "}
                        {formatDateDisplay(trip.endDate)}
                      </span>
                    </div>

                    {/* Info Chips */}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-teal-navy">
                        <Users className="size-3" />
                        {trip.travellers}{" "}
                        {trip.travellers === 1 ? "traveller" : "travellers"}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-teal-navy">
                        <Wallet className="size-3" />
                        ₹{trip.budget.toLocaleString("en-IN")}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-teal-navy">
                        <MapPin className="size-3" />
                        {stops} {stops === 1 ? "stop" : "stops"}
                      </span>
                    </div>

                    {/* Estimated Cost */}
                    <div className="mt-4 flex items-baseline justify-between">
                      <span className="text-xs text-muted-foreground">
                        Estimated cost
                      </span>
                      <span className="font-serif text-lg font-bold text-teal-navy">
                        ₹{estimatedCost.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {/* Budget Progress Bar */}
                    <div className="mt-2">
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isOverBudget ? "bg-destructive" : "bg-primary"
                          }`}
                          style={{ width: `${budgetPercentage}%` }}
                        />
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span
                          className={
                            isOverBudget ? "text-destructive font-medium" : ""
                          }
                        >
                          {budgetPercentage}% of budget
                        </span>
                        {isOverBudget && (
                          <span className="flex items-center gap-0.5 text-destructive">
                            <AlertTriangle className="size-3" />
                            Over budget
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-5 flex gap-2.5">
                      <Link
                        href={`/trips/${trip.id}`}
                        className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
                      >
                        Open
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(trip.id)}
                        className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full border border-destructive/30 bg-card text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10"
                      >
                        <Trash2 className="size-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
