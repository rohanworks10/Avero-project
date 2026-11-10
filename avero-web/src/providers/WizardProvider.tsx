"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type TravelPace = "relaxed" | "balanced" | "packed";

export type WizardData = {
  destination: string;
  startDate: string;
  endDate: string;
  travellers: number;
  budget: number;
  pace: TravelPace;
  interests: string[];
};

export type WizardContextValue = {
  data: WizardData;
  updateWizard: (updates: Partial<WizardData>) => void;
  resetWizard: () => void;
  setDestination: (destination: string) => void;
  setStartDate: (startDate: string) => void;
  setEndDate: (endDate: string) => void;
  setTravellers: (travellers: number) => void;
  setBudget: (budget: number) => void;
  setPace: (pace: TravelPace) => void;
  setInterests: (interests: string[]) => void;
};

const STORAGE_KEY = "avero_wizard_data";

export const DEFAULT_WIZARD_DATA: WizardData = {
  destination: "Belagavi, Karnataka",
  startDate: "",
  endDate: "",
  travellers: 2,
  budget: 35000,
  pace: "balanced",
  interests: [],
};

const WizardContext = createContext<WizardContextValue | null>(null);

function isWizardData(value: unknown): value is Partial<WizardData> {
  return typeof value === "object" && value !== null;
}

function readStoredData(): Partial<WizardData> | null {
  try {
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      return null;
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed: unknown = JSON.parse(stored);
    return isWizardData(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeStoredData(data: WizardData): void {
  try {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  } catch {
    // Ignore quota or private browsing storage errors
  }
}

export function WizardProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<WizardData>(DEFAULT_WIZARD_DATA);

  useEffect(() => {
    const stored = readStoredData();
    if (stored) {
      queueMicrotask(() => {
        setData((prev) => ({
          ...prev,
          ...stored,
          travellers:
            typeof stored.travellers === "number" &&
            stored.travellers >= 1 &&
            stored.travellers <= 10
              ? stored.travellers
              : prev.travellers,
          budget:
            typeof stored.budget === "number" &&
            stored.budget >= 5000 &&
            stored.budget <= 100000
              ? stored.budget
              : prev.budget,
          pace:
            stored.pace === "relaxed" ||
            stored.pace === "balanced" ||
            stored.pace === "packed"
              ? stored.pace
              : prev.pace,
          interests: Array.isArray(stored.interests)
            ? stored.interests
            : prev.interests,
        }));
      });
    }
  }, []);

  const updateWizard = useCallback((updates: Partial<WizardData>) => {
    setData((prev) => {
      const next = { ...prev, ...updates };
      writeStoredData(next);
      return next;
    });
  }, []);

  const resetWizard = useCallback(() => {
    setData(DEFAULT_WIZARD_DATA);
    try {
      if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }, []);

  const setDestination = useCallback(
    (destination: string) => updateWizard({ destination }),
    [updateWizard]
  );
  const setStartDate = useCallback(
    (startDate: string) => updateWizard({ startDate }),
    [updateWizard]
  );
  const setEndDate = useCallback(
    (endDate: string) => updateWizard({ endDate }),
    [updateWizard]
  );
  const setTravellers = useCallback(
    (travellers: number) => updateWizard({ travellers }),
    [updateWizard]
  );
  const setBudget = useCallback(
    (budget: number) => updateWizard({ budget }),
    [updateWizard]
  );
  const setPace = useCallback(
    (pace: TravelPace) => updateWizard({ pace }),
    [updateWizard]
  );
  const setInterests = useCallback(
    (interests: string[]) => updateWizard({ interests }),
    [updateWizard]
  );

  const value = useMemo(
    () => ({
      data,
      updateWizard,
      resetWizard,
      setDestination,
      setStartDate,
      setEndDate,
      setTravellers,
      setBudget,
      setPace,
      setInterests,
    }),
    [
      data,
      updateWizard,
      resetWizard,
      setDestination,
      setStartDate,
      setEndDate,
      setTravellers,
      setBudget,
      setPace,
      setInterests,
    ]
  );

  return (
    <WizardContext.Provider value={value}>{children}</WizardContext.Provider>
  );
}

export function useWizard(): WizardContextValue {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizard must be used within WizardProvider");
  }
  return context;
}

