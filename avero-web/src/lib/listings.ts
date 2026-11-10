import {
  getLiveListingsFromStore,
  getListingByIdFromStore,
  addListing,
  updateStatus,
  getAllListings,
  type Listing,
  type ListingStatus,
  type PriceRange,
  type NewListingInput,
} from "./listings-store";

export type { Listing, ListingStatus, PriceRange, NewListingInput };
export { addListing, updateStatus, getAllListings };

export type ScoredListing = Listing & {
  score: number;
};

export type DaySlotName = "morning" | "afternoon" | "evening";

export type DayPlan = {
  day: number;
  dayNumber: number;
  morning: Listing | null;
  afternoon: Listing | null;
  evening: Listing | null;
  slots: {
    morning: Listing[];
    afternoon: Listing[];
    evening: Listing[];
  };
  stops: Listing[];
};

/**
 * Returns all live listings stored in the in-memory / persisted store.
 */
export function getLiveListings(): Listing[] {
  return getLiveListingsFromStore();
}

/**
 * Retrieves a single listing by its unique identifier.
 */
export function getListingById(id: string): Listing | null {
  return getListingByIdFromStore(id);
}

/**
 * Checks if a listing's price range fits within the user's budget.
 */
function isPriceWithinBudget(priceRange: PriceRange, budget: number): boolean {
  if (!budget || budget <= 0) return true;

  // High budget (₹50,000+ trip budget or ₹2,000+ per stop): all price tiers valid
  if (budget >= 50000 || (budget < 10000 && budget >= 2000)) {
    return true;
  }

  // Moderate budget (₹20,000 to ₹50,000 trip budget or ₹500 to ₹2,000 per stop):
  // Allow budget (₹) and moderate (₹₹) tiers
  if (budget >= 20000 || (budget < 10000 && budget >= 500)) {
    return priceRange === "₹" || priceRange === "₹₹";
  }

  // Low/tight budget: allow only budget tier (₹)
  return priceRange === "₹";
}

/**
 * Returns live listings scored by interest-tag overlap, filtered by price range
 * against budget, sorted by overlap score descending.
 */
export function matchListings(
  interests: string[],
  budget: number,
  pace: string = "balanced"
): ScoredListing[] {
  void pace;
  const live = getLiveListings();

  // Filter by price range against budget
  let candidates = live.filter((item) =>
    isPriceWithinBudget(item.priceRange, budget)
  );

  // If budget filtering removes all items, fall back to affordable tier or all live
  if (candidates.length === 0) {
    candidates = live.filter((item) => item.priceRange === "₹");
    if (candidates.length === 0) {
      candidates = live;
    }
  }

  const normalizedInterests = new Set(
    (interests || [])
      .map((item) => item.toLowerCase().trim())
      .filter(Boolean)
  );

  // Score listings by overlap with the requested interest tags
  const scored: ScoredListing[] = candidates.map((listing) => {
    const score = listing.interestTags.reduce((acc, tag) => {
      return normalizedInterests.has(tag.toLowerCase().trim()) ? acc + 1 : acc;
    }, 0);

    return {
      ...listing,
      score,
    };
  });

  // Sort descending by match score
  scored.sort((a, b) => b.score - a.score);

  return scored;
}

/**
 * Splits matched listings into day-wise morning, afternoon and evening slots:
 * - relaxed = 2 stops a day
 * - balanced = 3 stops a day
 * - packed = 4 stops a day
 */
export function groupIntoDays(
  listings: Listing[],
  days: number,
  pace: string = "balanced"
): DayPlan[] {
  const totalDays = Math.max(1, Math.round(days || 1));
  const normalizedPace = (pace || "").toLowerCase().trim();

  let stopsPerDay = 3;
  if (normalizedPace === "relaxed") {
    stopsPerDay = 2;
  } else if (normalizedPace === "packed") {
    stopsPerDay = 4;
  }

  const result: DayPlan[] = [];

  for (let d = 0; d < totalDays; d++) {
    const startIndex = d * stopsPerDay;
    const dayStops: Listing[] = [];

    for (let s = 0; s < stopsPerDay; s++) {
      const index = startIndex + s;
      if (index < listings.length) {
        dayStops.push(listings[index]);
      } else if (listings.length > 0) {
        // Cycle from top matches if total requested slots exceed available listings
        dayStops.push(listings[index % listings.length]);
      }
    }

    const morningListings: Listing[] = [];
    const afternoonListings: Listing[] = [];
    const eveningListings: Listing[] = [];

    if (stopsPerDay === 2) {
      // Relaxed: 2 stops (morning, afternoon)
      if (dayStops[0]) morningListings.push(dayStops[0]);
      if (dayStops[1]) afternoonListings.push(dayStops[1]);
    } else if (stopsPerDay === 4) {
      // Packed: 4 stops (morning, 2 in afternoon, evening)
      if (dayStops[0]) morningListings.push(dayStops[0]);
      if (dayStops[1]) afternoonListings.push(dayStops[1]);
      if (dayStops[2]) afternoonListings.push(dayStops[2]);
      if (dayStops[3]) eveningListings.push(dayStops[3]);
    } else {
      // Balanced: 3 stops (morning, afternoon, evening)
      if (dayStops[0]) morningListings.push(dayStops[0]);
      if (dayStops[1]) afternoonListings.push(dayStops[1]);
      if (dayStops[2]) eveningListings.push(dayStops[2]);
    }

    result.push({
      day: d + 1,
      dayNumber: d + 1,
      morning: morningListings[0] ?? null,
      afternoon: afternoonListings[0] ?? null,
      evening: eveningListings[0] ?? null,
      slots: {
        morning: morningListings,
        afternoon: afternoonListings,
        evening: eveningListings,
      },
      stops: dayStops,
    });
  }

  return result;
}
