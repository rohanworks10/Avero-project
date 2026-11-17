import initialSeedData from "@/data/listings.json";

export type PriceRange = "₹" | "₹₹" | "₹₹₹";

export type ListingStatus = "pending" | "verified" | "live";

export type Listing = {
  id: string;
  name: string;
  category: string;
  area: string;
  priceRange: PriceRange;
  interestTags: string[];
  status: ListingStatus;
  description: string;
  avgCost: number;
  shortDescription: string;
  walkMinutes: number;
};

type StoredListing = Omit<Listing, "shortDescription" | "walkMinutes"> &
  Partial<Pick<Listing, "shortDescription" | "walkMinutes">>;

export type NewListingInput = Omit<
  Listing,
  "id" | "shortDescription" | "walkMinutes"
> & {
  id?: string;
  shortDescription?: string;
  walkMinutes?: number;
};

const STORAGE_KEY = "avero_listings";

let memoryStore: Listing[] | null = null;

function isListing(item: unknown): item is StoredListing {
  if (!item || typeof item !== "object") return false;
  const record = item as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.name === "string" &&
    typeof record.category === "string" &&
    typeof record.area === "string" &&
    (record.priceRange === "₹" ||
      record.priceRange === "₹₹" ||
      record.priceRange === "₹₹₹") &&
    Array.isArray(record.interestTags) &&
    (record.status === "pending" ||
      record.status === "verified" ||
      record.status === "live") &&
    typeof record.description === "string" &&
    typeof record.avgCost === "number" &&
    (record.shortDescription === undefined ||
      typeof record.shortDescription === "string") &&
    (record.walkMinutes === undefined ||
      typeof record.walkMinutes === "number")
  );
}

function addListingDetails(item: StoredListing): Listing {
  return {
    ...item,
    shortDescription: item.shortDescription ?? item.description,
    walkMinutes: item.walkMinutes ?? 10,
  };
}

function getInitialListings(): Listing[] {
  const seed = initialSeedData as unknown[];
  const validated: Listing[] = [];
  for (const item of seed) {
    if (isListing(item)) {
      validated.push(addListingDetails(item));
    }
  }
  return validated;
}

function loadListings(): Listing[] {
  if (typeof window === "undefined") {
    return getInitialListings();
  }

  if (memoryStore !== null) {
    return memoryStore;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const validated: Listing[] = [];
        for (const item of parsed) {
          if (isListing(item)) {
            validated.push(addListingDetails(item));
          }
        }
        if (validated.length > 0) {
          memoryStore = validated;
          return memoryStore;
        }
      }
    }
  } catch {
    // Fall back to seed listings if localStorage is unavailable
  }

  memoryStore = getInitialListings();
  persistListings(memoryStore);
  return memoryStore;
}

function persistListings(listings: Listing[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
  } catch {
    // Safely ignore storage quota / disabled storage errors
  }
}

export function getAllListings(): Listing[] {
  return [...loadListings()];
}

export function getLiveListingsFromStore(): Listing[] {
  return loadListings().filter((item) => item.status === "live");
}

export function getListingByIdFromStore(id: string): Listing | null {
  const found = loadListings().find((item) => item.id === id);
  return found ? { ...found } : null;
}

export function addListing(input: NewListingInput): Listing {
  const current = loadListings();
  const id =
    input.id ||
    `listing-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const newListing: Listing = {
    id,
    name: input.name,
    category: input.category,
    area: input.area,
    priceRange: input.priceRange,
    interestTags: [...input.interestTags],
    status: input.status,
    description: input.description,
    avgCost: input.avgCost,
    shortDescription: input.shortDescription ?? input.description,
    walkMinutes: input.walkMinutes ?? 10,
  };

  memoryStore = [newListing, ...current];
  persistListings(memoryStore);
  return newListing;
}

export function updateStatus(
  id: string,
  status: ListingStatus
): Listing | null {
  const current = loadListings();
  const index = current.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const updated: Listing = {
    ...current[index],
    status,
  };

  const next = [...current];
  next[index] = updated;
  memoryStore = next;
  persistListings(memoryStore);
  return updated;
}

export function resetListingsStore(): void {
  memoryStore = getInitialListings();
  persistListings(memoryStore);
}
