"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DayTabs, type ItineraryView } from "@/components/itinerary/DayTabs";
import { StopCard } from "@/components/itinerary/StopCard";
import { Footer } from "@/components/ui/footer";
import { JourneyPath } from "@/components/ui/journey-path";
import { Navbar } from "@/components/ui/navbar";
import { getInterestById } from "@/data/interests";
import {
  getAllListings,
  getNearbyLocals,
  type Listing,
  type NearbyLocal,
} from "@/lib/listings";
import {
  addLocalListingToTrip,
  addListingToTrip,
  createTripFromWizard,
  getCurrentTrip,
  removeListingFromTrip,
  type Trip,
  type TripSlot,
} from "@/lib/trips-store";
import { useWizard } from "@/providers/WizardProvider";

const slotDetails: {
  slot: TripSlot;
  title: string;
  time: string;
  duration: string;
}[] = [
  { slot: "morning", title: "Morning", time: "09:00 AM", duration: "3.5 hrs" },
  { slot: "afternoon", title: "Afternoon", time: "01:00 PM", duration: "4 hrs" },
  { slot: "evening", title: "Evening", time: "06:00 PM", duration: "3.5 hrs" },
];

export default function ItineraryPage() {
  const router = useRouter();
  const { data: wizardData } = useWizard();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [view, setView] = useState<ItineraryView>("list");
  const [activeListing, setActiveListing] = useState<Listing | null>(null);

  useEffect(() => {
    const existing = getCurrentTrip();
    if (existing) {
      queueMicrotask(() => {
        setTrip(existing);
        setIsReady(true);
      });
      return;
    }

    const hasDates = Boolean(wizardData.startDate && wizardData.endDate);
    const hasInterests = wizardData.interests.length > 0;
    if (!hasDates || !hasInterests) {
      router.replace("/onboarding/trip-setup");
      return;
    }

    const created = createTripFromWizard(wizardData);
    queueMicrotask(() => {
      setTrip(created);
      setIsReady(true);
    });
  }, [router, wizardData]);

  useEffect(() => {
    const storedListings = getAllListings();
    queueMicrotask(() => setListings(storedListings));
  }, []);

  function handleRemoveListing(listingId: string) {
    const updated = removeListingFromTrip(listingId);
    if (updated) setTrip(updated);
  }

  function handleAddLocal(local: NearbyLocal) {
    const updated = addLocalListingToTrip(local.id);
    if (updated) setTrip(updated);
  }

  function handleAddJourneyListing(
    listingId: string,
    dayNumber: number,
    slot: TripSlot
  ) {
    const updated = addListingToTrip(listingId, dayNumber, slot);
    if (updated) setTrip(updated);
  }

  const currentDay = trip?.days[selectedDayIndex] ?? trip?.days[0] ?? null;
  const slotsData = useMemo(
    () =>
      currentDay
        ? slotDetails.map((details) => {
            const listingId = currentDay[details.slot];
            return {
              ...details,
              listingId,
              listing:
                listingId
                  ? listings.find((listing) => listing.id === listingId) ?? null
                  : null,
            };
          })
        : [],
    [currentDay, listings]
  );
  const addedLocalIds = useMemo(
    () =>
      new Set(
        (trip?.days ?? [])
          .flatMap((day) => [day.morning, day.afternoon, day.evening])
          .filter((id): id is string => Boolean(id))
          .concat(trip?.localListingIds ?? [])
      ),
    [trip]
  );
  const numberedSlots = useMemo(() => {
    let stopNumber = 0;
    return slotsData.map((slot) => ({
      ...slot,
      stopNumber: slot.listing ? ++stopNumber : null,
    }));
  }, [slotsData]);

  if (!isReady || !trip) {
    return (
      <div className="flex min-h-screen flex-col bg-cream text-teal-navy">
        <Navbar />
        <main className="flex flex-1 items-center justify-center p-8">
          <p className="font-serif text-xl font-medium">
            Putting your local itinerary together...
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  const destination = trip.destination.split(",")[0] || trip.destination;
  const selectedInterests = trip.interests
    .slice(0, 3)
    .map((interest) => getInterestById(interest)?.label ?? interest);
  const hasStops = numberedSlots.some((slot) => slot.listing !== null);

  return (
    <div className="flex min-h-screen flex-col bg-cream text-teal-navy">
      <Navbar />

      <main className="flex-1">
        <header className="avero-gradient">
          <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-11 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-navy/70">
              Your trip, shaped around local life
            </p>
            <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-teal-navy sm:text-4xl lg:text-5xl">
              Your {trip.days.length}{" "}
              {trip.days.length === 1 ? "day" : "days"} in {destination}
            </h1>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/70 bg-white/75 px-3.5 py-1.5 text-xs font-medium text-teal-navy">
                Budget · ₹{trip.budget.toLocaleString("en-IN")}
              </span>
              <span className="rounded-full border border-white/70 bg-white/75 px-3.5 py-1.5 text-xs font-medium capitalize text-teal-navy">
                Pace · {trip.pace}
              </span>
              <span className="rounded-full border border-white/70 bg-white/75 px-3.5 py-1.5 text-xs font-medium text-teal-navy">
                Interests ·{" "}
                {selectedInterests.length > 0
                  ? selectedInterests.join(" · ")
                  : "Not selected"}
              </span>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <DayTabs
            days={trip.days}
            selectedIndex={selectedDayIndex}
            onSelectDay={setSelectedDayIndex}
            view={view}
            onChangeView={setView}
          />

          {!currentDay ? (
            <section className="my-10 rounded-3xl border border-teal-navy/10 bg-white px-6 py-12 text-center">
              <h2 className="font-serif text-2xl font-semibold text-teal-navy">
                No days in this trip yet
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                Go back to Trip Setup to choose your dates and build an itinerary.
              </p>
              <Link
                href="/onboarding/trip-setup"
                className="mt-5 inline-flex rounded-full bg-terracotta px-5 py-2.5 text-sm font-semibold text-white"
              >
                Return to Trip Setup
              </Link>
            </section>
          ) : view === "journey" ? (
            <div className="py-7 sm:py-9">
              <JourneyPath
                dayNumber={currentDay.dayNumber}
                date={currentDay.date}
                slots={slotsData.map(
                  ({ slot, title, time, listingId }) => ({
                    slot,
                    title,
                    timeLabel: time,
                    listingId,
                  })
                )}
                trip={trip}
                onSelectListing={setActiveListing}
                onAddListing={handleAddJourneyListing}
              />
            </div>
          ) : !hasStops ? (
            <section className="my-8 rounded-3xl border border-teal-navy/10 bg-white px-6 py-12 text-center sm:my-10">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber/25 text-teal-navy">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="size-6"
                >
                  <path
                    d="M12 3v2m0 14v2M3 12h2m14 0h2M5.64 5.64l1.42 1.42m9.88 9.88 1.42 1.42m0-12.72-1.42 1.42m-9.88 9.88-1.42 1.42M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h2 className="mt-4 font-serif text-2xl font-semibold text-teal-navy">
                A day with room to wander
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                There are no stops on Day {currentDay.dayNumber} yet. Add a local
                place from Discover or revisit Trip Setup to shape this day.
              </p>
              <Link
                href="/discover"
                className="mt-5 inline-flex rounded-full bg-terracotta px-5 py-2.5 text-sm font-semibold text-white"
              >
                Discover local places
              </Link>
            </section>
          ) : (
            <div className="py-7 sm:py-9">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-terracotta">
                  Day {currentDay.dayNumber}
                </p>
                <h2 className="mt-1 font-serif text-2xl font-semibold text-teal-navy sm:text-3xl">
                  Places to make the day yours
                </h2>
              </div>

              <div className="relative space-y-8 pb-6">
                <div
                  aria-hidden="true"
                  className="absolute bottom-10 left-[17px] top-12 w-px bg-terracotta/30 sm:left-[19px]"
                />
                {numberedSlots.map((item) => {
                  if (!item.listing) {
                    return (
                      <section key={item.slot}>
                        <h3 className="mb-3 pl-[3.25rem] font-serif text-lg font-semibold text-teal-navy">
                          {item.title}
                        </h3>
                        <div className="ml-[3.25rem] rounded-2xl border border-dashed border-teal-navy/15 bg-white/70 px-4 py-3.5">
                          <p className="text-xs font-medium text-teal-navy">
                            An open stretch of the day
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Keep this time flexible for an unplanned local find.
                          </p>
                        </div>
                      </section>
                    );
                  }

                  const listing = item.listing;
                  const nearbyLocals = getNearbyLocals(
                    listing,
                    { budget: trip.budget, interests: trip.interests },
                    listings,
                    3
                  );
                  const matchingInterests = listing.interestTags
                    .filter((tag) => trip.interests.includes(tag))
                    .map((tag) => getInterestById(tag)?.label.toLowerCase() ?? tag);
                  const why =
                    matchingInterests.length > 0
                      ? `Chosen for your ${matchingInterests.join(" + ")} interests`
                      : `A local highlight for your ${trip.pace} pace`;

                  return (
                    <section key={item.slot}>
                      <h3 className="mb-3 pl-[3.25rem] font-serif text-lg font-semibold text-teal-navy">
                        {item.title}
                      </h3>
                      <StopCard
                        number={item.stopNumber ?? 1}
                        listing={listing}
                        time={item.time}
                        duration={item.duration}
                        why={why}
                        nearbyLocals={nearbyLocals}
                        addedLocalIds={addedLocalIds}
                        onAddLocal={handleAddLocal}
                        onRemove={handleRemoveListing}
                        onSelect={setActiveListing}
                      />
                    </section>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      {activeListing && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="listing-details-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <button
            type="button"
            aria-label="Close listing details"
            onClick={() => setActiveListing(null)}
            className="absolute inset-0 bg-teal-navy/45"
          />
          <section className="relative z-10 w-full max-w-lg rounded-3xl border border-teal-navy/10 bg-white p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-terracotta">
                  {activeListing.category} · {activeListing.priceRange}
                </p>
                <h2
                  id="listing-details-title"
                  className="mt-2 font-serif text-2xl font-semibold text-teal-navy"
                >
                  {activeListing.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveListing(null)}
                aria-label="Close listing details"
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-cream text-teal-navy"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="size-4"
                >
                  <path
                    d="m4 4 8 8m0-8-8 8"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {activeListing.area}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-teal-navy/80">
              {activeListing.description}
            </p>
            <p className="mt-4 border-t border-teal-navy/10 pt-3 text-sm font-semibold text-teal-navy">
              ₹{activeListing.avgCost.toLocaleString("en-IN")} average per person
            </p>
          </section>
        </div>
      )}

      <Footer />
    </div>
  );
}
