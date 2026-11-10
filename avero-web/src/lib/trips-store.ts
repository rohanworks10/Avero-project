import {
  getListingById,
  matchListings,
  groupIntoDays,
} from "./listings";
import type { WizardData } from "@/providers/WizardProvider";

export type TripSlot = "morning" | "afternoon" | "evening";

export type TripDay = {
  dayNumber: number;
  date: string;
  morning: string | null;
  afternoon: string | null;
  evening: string | null;
};

export type Trip = {
  id: string;
  createdAt: string;
  destination: string;
  startDate: string;
  endDate: string;
  travellers: number;
  budget: number;
  pace: string;
  interests: string[];
  days: TripDay[];
};

const CURRENT_TRIP_KEY = "avero_current_trip";
const SAVED_TRIPS_KEY = "avero_saved_trips";

let inMemoryCurrentTrip: Trip | null = null;
let inMemorySavedTrips: Trip[] | null = null;

function calculateDaysCount(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 1;
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  if (isNaN(start) || isNaN(end) || end < start) return 1;
  return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
}

function addDaysToDate(baseDateStr: string, daysToAdd: number): string {
  if (!baseDateStr) return "";
  const parts = baseDateStr.split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return baseDateStr;
  const [year, month, day] = parts;
  const d = new Date(year, month - 1, day + daysToAdd);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function isTrip(value: unknown): value is Trip {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.destination === "string" &&
    typeof record.startDate === "string" &&
    typeof record.endDate === "string" &&
    typeof record.travellers === "number" &&
    typeof record.budget === "number" &&
    Array.isArray(record.days)
  );
}

function persistCurrentTrip(trip: Trip | null): void {
  inMemoryCurrentTrip = trip;
  if (typeof window === "undefined") return;
  try {
    if (trip) {
      localStorage.setItem(CURRENT_TRIP_KEY, JSON.stringify(trip));
    } else {
      localStorage.removeItem(CURRENT_TRIP_KEY);
    }
  } catch {
    // Ignore quota or disabled storage errors
  }
}

function persistSavedTrips(trips: Trip[]): void {
  inMemorySavedTrips = trips;
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SAVED_TRIPS_KEY, JSON.stringify(trips));
  } catch {
    // Ignore quota or disabled storage errors
  }
}

export function getCurrentTrip(): Trip | null {
  if (inMemoryCurrentTrip) return inMemoryCurrentTrip;
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CURRENT_TRIP_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (isTrip(parsed)) {
      inMemoryCurrentTrip = parsed;
      return parsed;
    }
  } catch {
    // Ignore
  }
  return null;
}

export function setCurrentTrip(trip: Trip): void {
  persistCurrentTrip(trip);
}

export function getSavedTrips(): Trip[] {
  if (inMemorySavedTrips) return inMemorySavedTrips;
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SAVED_TRIPS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const validated = parsed.filter(isTrip);
      inMemorySavedTrips = validated;
      return validated;
    }
  } catch {
    // Ignore
  }
  return [];
}

export function createTripFromWizard(wizardState: WizardData): Trip {
  const dayCount = calculateDaysCount(
    wizardState.startDate,
    wizardState.endDate
  );
  const matched = matchListings(
    wizardState.interests,
    wizardState.budget,
    wizardState.pace
  );
  const dayPlans = groupIntoDays(matched, dayCount, wizardState.pace);

  const days: TripDay[] = [];
  for (let i = 0; i < dayCount; i++) {
    const plan = dayPlans[i];
    const dateStr = addDaysToDate(wizardState.startDate, i);
    days.push({
      dayNumber: i + 1,
      date: dateStr,
      morning: plan?.morning?.id ?? null,
      afternoon: plan?.afternoon?.id ?? null,
      evening: plan?.evening?.id ?? null,
    });
  }

  const trip: Trip = {
    id: `trip-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    destination: wizardState.destination || "Belagavi, Karnataka",
    startDate: wizardState.startDate,
    endDate: wizardState.endDate,
    travellers: wizardState.travellers || 2,
    budget: wizardState.budget || 35000,
    pace: wizardState.pace || "balanced",
    interests: [...wizardState.interests],
    days,
  };

  setCurrentTrip(trip);
  return trip;
}

export function saveCurrentTrip(): Trip | null {
  const current = getCurrentTrip();
  if (!current) return null;

  const saved = getSavedTrips();
  const existingIndex = saved.findIndex((t) => t.id === current.id);
  let updatedSaved: Trip[];
  if (existingIndex >= 0) {
    updatedSaved = [...saved];
    updatedSaved[existingIndex] = { ...current };
  } else {
    updatedSaved = [current, ...saved];
  }

  persistSavedTrips(updatedSaved);
  return current;
}

export function deleteSavedTrip(tripId: string): void {
  const saved = getSavedTrips();
  persistSavedTrips(saved.filter((trip) => trip.id !== tripId));
}

export function getTripById(id: string): Trip | null {
  const current = getCurrentTrip();
  if (current?.id === id) return current;

  const saved = getSavedTrips();
  return saved.find((t) => t.id === id) || null;
}

export function addListingToTrip(
  listingId: string,
  dayNumber?: number,
  slot?: TripSlot
): Trip | null {
  const current = getCurrentTrip();
  if (!current) return null;

  const updatedDays: TripDay[] = current.days.map((d) => ({ ...d }));

  if (typeof dayNumber === "number" && slot) {
    const targetDay = updatedDays.find((d) => d.dayNumber === dayNumber);
    if (targetDay) {
      targetDay[slot] = listingId;
    }
  } else {
    // Put in the first free slot
    let placed = false;
    for (const day of updatedDays) {
      if (day.morning === null) {
        day.morning = listingId;
        placed = true;
        break;
      }
      if (day.afternoon === null) {
        day.afternoon = listingId;
        placed = true;
        break;
      }
      if (day.evening === null) {
        day.evening = listingId;
        placed = true;
        break;
      }
    }
    if (!placed && updatedDays.length > 0) {
      updatedDays[0].afternoon = listingId;
    }
  }

  const updatedTrip: Trip = {
    ...current,
    days: updatedDays,
  };

  setCurrentTrip(updatedTrip);

  const saved = getSavedTrips();
  const idx = saved.findIndex((t) => t.id === updatedTrip.id);
  if (idx >= 0) {
    const nextSaved = [...saved];
    nextSaved[idx] = updatedTrip;
    persistSavedTrips(nextSaved);
  }

  return updatedTrip;
}

export function removeListingFromTrip(listingId: string): Trip | null {
  const current = getCurrentTrip();
  if (!current) return null;

  const updatedDays: TripDay[] = current.days.map((d) => {
    return {
      ...d,
      morning: d.morning === listingId ? null : d.morning,
      afternoon: d.afternoon === listingId ? null : d.afternoon,
      evening: d.evening === listingId ? null : d.evening,
    };
  });

  const updatedTrip: Trip = {
    ...current,
    days: updatedDays,
  };

  setCurrentTrip(updatedTrip);

  const saved = getSavedTrips();
  const idx = saved.findIndex((t) => t.id === updatedTrip.id);
  if (idx >= 0) {
    const nextSaved = [...saved];
    nextSaved[idx] = updatedTrip;
    persistSavedTrips(nextSaved);
  }

  return updatedTrip;
}

export function estimateTripCost(trip: Trip): number {
  if (!trip || !Array.isArray(trip.days)) return 0;
  const travellers = Math.max(1, trip.travellers || 1);
  let total = 0;

  for (const day of trip.days) {
    const slots = [day.morning, day.afternoon, day.evening];
    for (const listingId of slots) {
      if (listingId) {
        const listing = getListingById(listingId);
        if (listing) {
          total += listing.avgCost * travellers;
        }
      }
    }
  }

  return total;
}
