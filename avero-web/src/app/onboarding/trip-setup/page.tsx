"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  ChevronLeft,
  Coffee,
  Compass,
  Landmark,
  MapPin,
  Minus,
  Palette,
  Plus,
  Rocket,
  ShoppingBag,
  Sparkles,
  Trees,
  Users,
  Utensils,
  Wallet,
  Wine,
} from "lucide-react";
import { interests } from "@/data/interests";
import { type TravelPace, useWizard } from "@/providers/WizardProvider";

const interestIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Utensils,
  Landmark,
  Trees,
  Compass,
  ShoppingBag,
  Wine,
  Sparkles,
  Palette,
};

const budgetPresets = [
  {
    label: "Budget",
    amount: 15000,
    tag: "Essential stays & street eats",
  },
  {
    label: "Comfortable",
    amount: 40000,
    tag: "Boutique stays & guided tours",
  },
  {
    label: "Premium",
    amount: 85000,
    tag: "Luxury retreats & private craft tours",
  },
];

const paceOptions: {
  id: TravelPace;
  label: string;
  stops: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: "relaxed",
    label: "Relaxed",
    stops: "2 stops / day",
    description: "Take it slow with plenty of downtime to soak in the local rhythm.",
    icon: Coffee,
  },
  {
    id: "balanced",
    label: "Balanced",
    stops: "3 stops / day",
    description: "The ideal balance of morning heritage, afternoon cafe, and evening unwind.",
    icon: Compass,
  },
  {
    id: "packed",
    label: "Packed",
    stops: "4 stops / day",
    description: "High-energy adventure maximizing every single hour of your journey.",
    icon: Rocket,
  },
];

const loadingPhrases = [
  "Matching local businesses...",
  "Balancing your budget...",
  "Building your days...",
  "Finalizing your personalized itinerary...",
];

function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return dateStr;
  const [year, month, day] = parts;
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function calculateDays(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  if (isNaN(start) || isNaN(end) || end < start) return 0;
  return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
}

export default function TripSetupWizardPage() {
  const router = useRouter();
  const {
    data,
    setDestination,
    setStartDate,
    setEndDate,
    setTravellers,
    setBudget,
    setPace,
    setInterests,
  } = useWizard();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [errors, setErrors] = useState<{
    destination?: string;
    startDate?: string;
    endDate?: string;
    interests?: string;
  }>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);

  // Generate unique accessible IDs for Step 1 form fields
  const destinationInputId = useId();
  const startDateInputId = useId();
  const endDateInputId = useId();

  // Rotating phrases during generating transition
  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      setLoadingPhraseIndex((prev) => (prev + 1) % loadingPhrases.length);
    }, 650);
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Validation per step
  function validateStep(step: number): boolean {
    const nextErrors: typeof errors = {};

    if (step === 1) {
      if (!data.destination.trim()) {
        nextErrors.destination = "Please enter a destination.";
      }
      if (!data.startDate) {
        nextErrors.startDate = "Please select a start date.";
      }
      if (!data.endDate) {
        nextErrors.endDate = "Please select an end date.";
      } else if (data.startDate && data.endDate <= data.startDate) {
        nextErrors.endDate = "End date must be after start date.";
      }
    } else if (step === 4) {
      if (data.interests.length < 2) {
        nextErrors.interests = "Please pick at least 2 interests to personalize your itinerary.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleNext() {
    if (!validateStep(currentStep)) return;
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleFinalSubmit();
    }
  }

  function handleBack() {
    if (currentStep > 1) {
      setErrors({});
      setCurrentStep((prev) => prev - 1);
    }
  }

  function handleFinalSubmit() {
    if (!validateStep(4)) return;
    setIsGenerating(true);
    setTimeout(() => {
      router.push("/trip/itinerary");
    }, 2500);
  }

  function toggleInterest(id: string) {
    const exists = data.interests.includes(id);
    const updated = exists
      ? data.interests.filter((i) => i !== id)
      : [...data.interests, id];
    setInterests(updated);
    if (updated.length >= 2 && errors.interests) {
      setErrors((prev) => ({ ...prev, interests: undefined }));
    }
  }

  const tripDays = calculateDays(data.startDate, data.endDate);

  return (
    <div className="flex min-h-screen flex-col bg-cream text-foreground">
      {/* Top Wizard Header */}
      <header className="border-b border-border/50 bg-cream/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <div
              aria-hidden="true"
              className="flex size-8 items-center justify-center rounded-lg bg-teal-navy shadow-sm"
            >
              <svg viewBox="0 0 32 32" className="size-5" fill="none">
                <path
                  d="M5 10.2 27.5 5 10.2 16.3l4.7-1.1L5 27l5.8-9.2 8.5-5.3-9.1 1.8L5 10.2Z"
                  fill="var(--amber)"
                />
                <path
                  d="m5 10.2 14.3 2.3-9.1 5.3-5.2-7.6Z"
                  fill="var(--primary-foreground)"
                />
              </svg>
            </div>
            <span className="font-serif text-2xl font-semibold tracking-tight text-teal-navy">
              Avero
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal-navy/70">
              Step {currentStep} of 4
            </span>
            <div className="hidden h-2 w-28 overflow-hidden rounded-full bg-secondary sm:block">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="avero-gradient flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {/* Mobile Progress Bar */}
          <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-secondary sm:hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>

          {/* Two-Column Grid on Desktop */}
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
            {/* Left Column: Active Step Card */}
            <div className="lg:col-span-7 xl:col-span-8">
              <section className="relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 shadow-md sm:p-10">
                {/* Generation Transition Overlay */}
                <AnimatePresence>
                  {isGenerating && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-card/95 p-6 text-center backdrop-blur-md"
                    >
                      <motion.div
                        animate={{
                          scale: [1, 1.15, 1],
                          rotate: [0, 180, 360],
                        }}
                        transition={{
                          duration: 2.2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="flex size-20 items-center justify-center rounded-3xl bg-teal-navy text-primary-foreground shadow-lg"
                      >
                        <Sparkles className="size-10 text-amber" />
                      </motion.div>

                      <h2 className="mt-6 font-serif text-2xl font-semibold text-teal-navy sm:text-3xl">
                        Generating your trip...
                      </h2>

                      <div className="mt-3 h-8">
                        <AnimatePresence mode="wait">
                          <motion.p
                            key={loadingPhraseIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="text-sm font-medium text-muted-foreground"
                          >
                            {loadingPhrases[loadingPhraseIndex]}
                          </motion.p>
                        </AnimatePresence>
                      </div>

                      <div className="mt-6 flex items-center gap-1.5">
                        <span className="size-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                        <span className="size-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                        <span className="size-2 animate-bounce rounded-full bg-primary" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Step 1: Where and when */}
                {currentStep === 1 && (
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                      Step 1 of 4
                    </span>
                    <h1 className="mt-1 font-serif text-2xl font-semibold tracking-tight text-teal-navy sm:text-3xl">
                      Where to?
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Tell us your destination, dates, and who is travelling.
                    </p>

                    <div className="mt-6 space-y-5">
                      {/* Destination Input */}
                      <div>
                        <label
                          htmlFor={destinationInputId}
                          className="block text-xs font-semibold uppercase tracking-wider text-teal-navy"
                        >
                          Destination
                        </label>
                        <div
                          className={`mt-1.5 flex h-12 items-center gap-3 rounded-full border bg-cream/60 px-4 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/20 ${
                            errors.destination
                              ? "border-destructive"
                              : "border-border"
                          }`}
                        >
                          <MapPin
                            aria-hidden="true"
                            className="size-4 shrink-0 text-teal-navy"
                          />
                          <input
                            id={destinationInputId}
                            type="text"
                            value={data.destination}
                            onChange={(e) => {
                              setDestination(e.target.value);
                              if (errors.destination) {
                                setErrors((prev) => ({
                                  ...prev,
                                  destination: undefined,
                                }));
                              }
                            }}
                            placeholder="e.g. Belagavi, Karnataka"
                            className="h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                          />
                        </div>
                        {errors.destination && (
                          <p
                            role="alert"
                            className="px-4 pt-1.5 text-xs text-destructive"
                          >
                            {errors.destination}
                          </p>
                        )}
                      </div>

                      {/* Dates Grid */}
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {/* Start Date */}
                        <div>
                          <label
                            htmlFor={startDateInputId}
                            className="block text-xs font-semibold uppercase tracking-wider text-teal-navy"
                          >
                            Start date
                          </label>
                          <div
                            className={`mt-1.5 flex h-12 items-center gap-3 rounded-full border bg-cream/60 px-4 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/20 ${
                              errors.startDate
                                ? "border-destructive"
                                : "border-border"
                            }`}
                          >
                            <Calendar
                              aria-hidden="true"
                              className="size-4 shrink-0 text-teal-navy"
                            />
                            <input
                              id={startDateInputId}
                              type="date"
                              value={data.startDate}
                              onChange={(e) => {
                                setStartDate(e.target.value);
                                if (errors.startDate) {
                                  setErrors((prev) => ({
                                    ...prev,
                                    startDate: undefined,
                                  }));
                                }
                              }}
                              className="h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none"
                            />
                          </div>
                          {errors.startDate && (
                            <p
                              role="alert"
                              className="px-4 pt-1.5 text-xs text-destructive"
                            >
                              {errors.startDate}
                            </p>
                          )}
                        </div>

                        {/* End Date */}
                        <div>
                          <label
                            htmlFor={endDateInputId}
                            className="block text-xs font-semibold uppercase tracking-wider text-teal-navy"
                          >
                            End date
                          </label>
                          <div
                            className={`mt-1.5 flex h-12 items-center gap-3 rounded-full border bg-cream/60 px-4 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/20 ${
                              errors.endDate
                                ? "border-destructive"
                                : "border-border"
                            }`}
                          >
                            <Calendar
                              aria-hidden="true"
                              className="size-4 shrink-0 text-teal-navy"
                            />
                            <input
                              id={endDateInputId}
                              type="date"
                              value={data.endDate}
                              min={data.startDate || undefined}
                              onChange={(e) => {
                                setEndDate(e.target.value);
                                if (errors.endDate) {
                                  setErrors((prev) => ({
                                    ...prev,
                                    endDate: undefined,
                                  }));
                                }
                              }}
                              className="h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none"
                            />
                          </div>
                          {errors.endDate && (
                            <p
                              role="alert"
                              className="px-4 pt-1.5 text-xs text-destructive"
                            >
                              {errors.endDate}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Number of Travellers Stepper */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-teal-navy">
                          Number of travellers
                        </label>
                        <div className="mt-1.5 flex h-14 items-center justify-between rounded-full border border-border bg-cream/60 px-5">
                          <div className="flex items-center gap-3">
                            <Users
                              aria-hidden="true"
                              className="size-5 text-teal-navy"
                            />
                            <span className="text-sm font-medium text-foreground">
                              {data.travellers} {data.travellers === 1 ? "Traveller" : "Travellers"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              aria-label="Decrease travellers"
                              disabled={data.travellers <= 1}
                              onClick={() =>
                                setTravellers(Math.max(1, data.travellers - 1))
                              }
                              className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-teal-navy transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Minus className="size-4" />
                            </button>
                            <span className="w-6 text-center font-serif text-lg font-semibold text-teal-navy">
                              {data.travellers}
                            </span>
                            <button
                              type="button"
                              aria-label="Increase travellers"
                              disabled={data.travellers >= 10}
                              onClick={() =>
                                setTravellers(Math.min(10, data.travellers + 1))
                              }
                              className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-teal-navy transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Plus className="size-4" />
                            </button>
                          </div>
                        </div>
                        <p className="mt-1 px-4 text-xs text-muted-foreground">
                          Choose between 1 and 10 travellers.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Budget */}
                {currentStep === 2 && (
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                      Step 2 of 4
                    </span>
                    <h1 className="mt-1 font-serif text-2xl font-semibold tracking-tight text-teal-navy sm:text-3xl">
                      What is your budget?
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                      We will customize activities and spots that fit your spend.
                    </p>

                    <div className="mt-8 text-center">
                      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Target Budget
                      </span>
                      <p className="mt-1 font-serif text-4xl font-bold tracking-tight text-teal-navy sm:text-5xl">
                        ₹{data.budget.toLocaleString("en-IN")}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Estimated total for {data.travellers}{" "}
                        {data.travellers === 1 ? "traveller" : "travellers"}
                        {tripDays > 0 ? `, ${tripDays} days` : ""}
                      </p>
                    </div>

                    {/* Slider */}
                    <div className="mt-8 px-2">
                      <input
                        type="range"
                        min="5000"
                        max="100000"
                        step="1000"
                        value={data.budget}
                        onChange={(e) => setBudget(Number(e.target.value))}
                        aria-label="Trip budget slider"
                        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-secondary accent-primary"
                      />
                      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                        <span>₹5,000</span>
                        <span>₹50,000</span>
                        <span>₹1,00,000</span>
                      </div>
                    </div>

                    {/* Quick Presets */}
                    <div className="mt-8">
                      <p className="text-xs font-semibold uppercase tracking-wider text-teal-navy">
                        Quick presets
                      </p>
                      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {budgetPresets.map((preset) => {
                          const isSelected = data.budget === preset.amount;
                          return (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => setBudget(preset.amount)}
                              className={`flex flex-col items-start rounded-2xl border p-4 text-left transition-all ${
                                isSelected
                                  ? "border-primary bg-primary/5 shadow-xs"
                                  : "border-border bg-card hover:border-primary/40 hover:bg-secondary/40"
                              }`}
                            >
                              <div className="flex w-full items-center justify-between">
                                <span className="text-sm font-semibold text-foreground">
                                  {preset.label}
                                </span>
                                {isSelected && (
                                  <span className="flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                    <Check className="size-2.5" />
                                  </span>
                                )}
                              </div>
                              <span className="mt-1 font-serif text-lg font-bold text-teal-navy">
                                ₹{preset.amount.toLocaleString("en-IN")}
                              </span>
                              <span className="mt-1 text-[11px] leading-tight text-muted-foreground">
                                {preset.tag}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Pace */}
                {currentStep === 3 && (
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                      Step 3 of 4
                    </span>
                    <h1 className="mt-1 font-serif text-2xl font-semibold tracking-tight text-teal-navy sm:text-3xl">
                      Select your travel pace
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                      How many experiences would you like sequenced into each day?
                    </p>

                    <div className="mt-6 space-y-3.5">
                      {paceOptions.map((option) => {
                        const Icon = option.icon;
                        const isSelected = data.pace === option.id;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => setPace(option.id)}
                            className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition-all sm:p-5 ${
                              isSelected
                                ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/40"
                                : "border-border bg-card hover:border-primary/40 hover:bg-secondary/40"
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={`flex size-12 shrink-0 items-center justify-center rounded-2xl transition-colors ${
                                  isSelected
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-secondary text-teal-navy"
                                }`}
                              >
                                <Icon className="size-6" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h2 className="font-serif text-lg font-semibold text-foreground">
                                    {option.label}
                                  </h2>
                                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-teal-navy">
                                    {option.stops}
                                  </span>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                                  {option.description}
                                </p>
                              </div>
                            </div>

                            <div
                              className={`flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
                                isSelected
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border bg-card"
                              }`}
                            >
                              {isSelected && <Check className="size-3.5" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Step 4: Interests */}
                {currentStep === 4 && (
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                      Step 4 of 4
                    </span>
                    <h1 className="mt-1 font-serif text-2xl font-semibold tracking-tight text-teal-navy sm:text-3xl">
                      What excites you?
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Pick at least 2 interests to unlock tailored local recommendations.
                    </p>

                    <div className="mt-6">
                      <p className="mb-3 text-xs font-medium text-teal-navy/80">
                        Pick what excites you (minimum 2):
                      </p>

                      <div className="flex flex-wrap gap-2.5">
                        {interests.map((interest) => {
                          const Icon =
                            interestIcons[interest.icon] || Compass;
                          const isSelected = data.interests.includes(
                            interest.id
                          );
                          return (
                            <button
                              key={interest.id}
                              type="button"
                              onClick={() => toggleInterest(interest.id)}
                              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-all ${
                                isSelected
                                  ? "border-primary bg-primary text-primary-foreground shadow-xs"
                                  : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-secondary"
                              }`}
                            >
                              <Icon className="size-4 shrink-0" />
                              <span>{interest.label}</span>
                              {isSelected && (
                                <Check className="size-3.5 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {errors.interests && (
                        <p
                          role="alert"
                          className="pt-3 text-xs font-medium text-destructive"
                        >
                          {errors.interests}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Step Action Buttons */}
                <div className="mt-10 flex items-center justify-between border-t border-border/60 pt-6">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-teal-navy transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-ring"
                    >
                      <ChevronLeft className="size-4" />
                      <span>Back</span>
                    </button>
                  ) : (
                    <Link
                      href="/"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                      <ArrowLeft className="size-4" />
                      <span>Exit</span>
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    <span>
                      {currentStep === 4 ? "Create my trip" : "Next"}
                    </span>
                    {currentStep === 4 ? (
                      <Sparkles className="size-4" />
                    ) : (
                      <ArrowRight className="size-4" />
                    )}
                  </button>
                </div>
              </section>
            </div>

            {/* Right Column: Live "Your trip so far" Summary (Desktop) */}
            <aside className="lg:col-span-5 xl:col-span-4">
              <div className="sticky top-24 rounded-3xl border border-border/80 bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-border/60 pb-3.5">
                  <h2 className="font-serif text-lg font-semibold text-teal-navy">
                    Your trip so far
                  </h2>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    Live Draft
                  </span>
                </div>

                <div className="mt-5 space-y-4 text-sm">
                  {/* Destination */}
                  <div className="flex items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-teal-navy/10 text-teal-navy">
                      <MapPin className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Destination
                      </span>
                      <p className="truncate font-medium text-foreground">
                        {data.destination || "Belagavi, Karnataka"}
                      </p>
                    </div>
                    {currentStep !== 1 && (
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  {/* Dates */}
                  <div className="flex items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-teal-navy/10 text-teal-navy">
                      <Calendar className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Dates & Duration
                      </span>
                      <p className="font-medium text-foreground">
                        {data.startDate && data.endDate
                          ? `${formatDateDisplay(data.startDate)} – ${formatDateDisplay(data.endDate)} (${tripDays} Days)`
                          : "Dates not set yet"}
                      </p>
                    </div>
                    {currentStep !== 1 && (
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  {/* Travellers */}
                  <div className="flex items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-teal-navy/10 text-teal-navy">
                      <Users className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Group size
                      </span>
                      <p className="font-medium text-foreground">
                        {data.travellers} {data.travellers === 1 ? "Adult" : "Adults"}
                      </p>
                    </div>
                    {currentStep !== 1 && (
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  {/* Budget */}
                  <div className="flex items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-teal-navy/10 text-teal-navy">
                      <Wallet className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Budget Target
                      </span>
                      <p className="font-serif text-base font-semibold text-teal-navy">
                        ₹{data.budget.toLocaleString("en-IN")}
                      </p>
                    </div>
                    {currentStep !== 2 && (
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  {/* Pace */}
                  <div className="flex items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-teal-navy/10 text-teal-navy">
                      <Compass className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Travel Pace
                      </span>
                      <p className="font-medium text-foreground">
                        {data.pace.charAt(0).toUpperCase() + data.pace.slice(1)}{" "}
                        <span className="text-xs text-muted-foreground">
                          ({data.pace === "relaxed" ? "2 stops/day" : data.pace === "packed" ? "4 stops/day" : "3 stops/day"})
                        </span>
                      </p>
                    </div>
                    {currentStep !== 3 && (
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  {/* Selected Interests */}
                  <div className="border-t border-border/60 pt-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Selected Interests ({data.interests.length})
                    </span>
                    {data.interests.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {data.interests.map((id) => {
                          const interestObj = interests.find((i) => i.id === id);
                          return (
                            <span
                              key={id}
                              className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-teal-navy"
                            >
                              {interestObj ? interestObj.label : id}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="mt-1 text-xs italic text-muted-foreground">
                        Pick at least 2 interests in Step 4.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
