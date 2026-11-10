import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Calendar,
  FileText,
  Footprints,
  HeartHandshake,
  LayoutDashboard,
  MapPin,
  PlusCircle,
  ShieldCheck,
  Sliders,
  Sparkles,
  Store,
  TrendingUp,
  UserCheck,
  Wallet,
} from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";

const travellerSteps = [
  {
    number: "01",
    title: "Sign up",
    description:
      "Create your free traveller account in seconds to save preferences and unlock tailored local itineraries.",
    icon: UserCheck,
    tag: "Get Started",
  },
  {
    number: "02",
    title: "Trip Setup Wizard",
    description:
      "Enter your destination, dates, budget range, group size, and preferred pace—relaxed, balanced, or packed.",
    icon: Sliders,
    tag: "Preferences",
  },
  {
    number: "03",
    title: "Smart Matching",
    description:
      "Select your vibe—from street food and hidden architecture to wellness—and let our engine match you to local spots.",
    icon: Sparkles,
    tag: "AI Matching",
  },
  {
    number: "04",
    title: "Day-wise Itinerary",
    description:
      "Get a thoughtfully organized, realistic day-by-day plan with travel times and curated local stops.",
    icon: Calendar,
    tag: "Daily Plan",
  },
  {
    number: "05",
    title: "Discover and Add to Trip",
    description:
      "Browse verified independent workshops, boutique stays, and authentic food walks to seamlessly add to your itinerary.",
    icon: PlusCircle,
    tag: "Personalize",
  },
];

const businessSteps = [
  {
    number: "01",
    title: "Sign up",
    description:
      "Create your business owner account and set your business profile in a few straightforward steps.",
    icon: Store,
  },
  {
    number: "02",
    title: "Register Listing",
    description:
      "Detail your offerings, upload high-quality photos, define pricing, and showcase what makes your experience unique.",
    icon: FileText,
  },
  {
    number: "03",
    title: "Verification",
    description:
      "Our team quickly verifies credentials and authenticity so travellers book your experiences with complete confidence.",
    icon: BadgeCheck,
  },
  {
    number: "04",
    title: "Go Live and Dashboard",
    description:
      "Reach high-intent travellers actively planning their visits, manage bookings, and monitor performance in real time.",
    icon: LayoutDashboard,
  },
];

const features = [
  {
    icon: Sparkles,
    title: "Personalized Vibe Matching",
    description:
      "Filter by what truly inspires you—heritage craft, coastal walks, culinary secrets, or tranquil wellness retreats.",
  },
  {
    icon: ShieldCheck,
    title: "Vetted Independent Businesses",
    description:
      "Skip generic tourist hubs. Every artisan, guide, and cafe is individually verified for authenticity and quality.",
  },
  {
    icon: Wallet,
    title: "Smart Budget Guardrails",
    description:
      "Clear, upfront cost calculations help you design an unforgettable trip without unforeseen expenses.",
  },
  {
    icon: Footprints,
    title: "Paced Daily Sequencing",
    description:
      "Say goodbye to rushed schedules. Our smart planner optimizes daily routes according to your desired rhythm.",
  },
  {
    icon: HeartHandshake,
    title: "Direct Merchant Connection",
    description:
      "Support local communities by connecting directly with passionate hosts and independent businesses.",
  },
  {
    icon: TrendingUp,
    title: "Real-time Booking Insights",
    description:
      "Local businesses gain full visibility into traveller demand, trend analytics, and direct reservation inquiries.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="flex min-h-screen flex-col bg-cream text-foreground">
      <Navbar />

      <main className="flex-1">
        {/* Page Header with Belagavi Trip Preview */}
        <section className="avero-gradient border-b border-border/40 pb-16 pt-12 sm:pb-20 sm:pt-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-teal-navy/15 bg-card/60 px-4 py-1.5 shadow-xs backdrop-blur-sm">
                <span className="flex size-2 rounded-full bg-amber" />
                <span className="text-xs font-medium text-teal-navy">
                  Smart Local Tourism
                </span>
              </span>

              <h1 className="mt-6 font-serif text-4xl font-semibold tracking-tight text-teal-navy sm:text-5xl lg:text-6xl">
                How Avero Works
              </h1>
              <p className="mt-4 text-base leading-relaxed text-teal-navy/80 sm:text-lg">
                Discover authentic places matched to your vibe, budget, and pace.
                Here is how we bring travellers and verified local businesses together.
              </p>

              {/* Belagavi Trip Preview Card */}
              <div className="mt-10 sm:mt-12">
                <div className="mx-auto max-w-xl rounded-2xl border border-border/80 bg-card/90 p-5 text-left shadow-lg backdrop-blur-md sm:rounded-3xl sm:p-7">
                  <div className="flex items-center justify-between border-b border-border/60 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-xl bg-teal-navy/10 text-teal-navy">
                        <MapPin className="size-4" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Sample Trip
                        </p>
                        <p className="font-serif text-lg font-semibold text-teal-navy">
                          Belagavi, Karnataka
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-teal-navy">
                      3 Days • 2 Travelers
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-secondary/80 p-3">
                      <p className="text-xs text-muted-foreground">Budget</p>
                      <p className="mt-0.5 font-serif text-base font-semibold text-teal-navy">
                        ₹35,000
                      </p>
                    </div>
                    <div className="rounded-2xl bg-secondary/80 p-3">
                      <p className="text-xs text-muted-foreground">Pace</p>
                      <p className="mt-0.5 font-serif text-base font-semibold text-teal-navy">
                        Balanced
                      </p>
                    </div>
                    <div className="col-span-2 rounded-2xl bg-secondary/80 p-3 sm:col-span-1">
                      <p className="text-xs text-muted-foreground">Vibe</p>
                      <p className="mt-0.5 truncate font-serif text-base font-semibold text-teal-navy">
                        Heritage & Food
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      <Sparkles className="size-3" aria-hidden="true" />
                      Belagavi Fort
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      <Sparkles className="size-3" aria-hidden="true" />
                      Kunda Tasting
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      <Sparkles className="size-3" aria-hidden="true" />
                      Gokak Falls
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5 Steps for Travellers */}
        <section className="py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center rounded-full bg-amber/20 px-3.5 py-1 text-xs font-semibold text-teal-navy">
                For Travellers
              </span>
              <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-teal-navy sm:text-4xl lg:text-5xl">
                5 simple steps to your journey
              </h2>
              <p className="mt-3 text-base text-muted-foreground sm:text-lg">
                From your initial idea to a customized daily journey in five
                effortless steps.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {travellerSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.number}
                    className="relative flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-serif text-2xl font-bold text-primary/80">
                          {step.number}
                        </span>
                        <div className="flex size-10 items-center justify-center rounded-2xl bg-secondary text-teal-navy">
                          <Icon className="size-5" aria-hidden="true" />
                        </div>
                      </div>

                      <div className="mt-4">
                        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                          {step.tag}
                        </span>
                        <h3 className="mt-2 font-serif text-lg font-semibold text-foreground">
                          {step.title}
                        </h3>
                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                          {step.description}
                        </p>
                      </div>
                    </div>

                    {index < travellerSteps.length - 1 && (
                      <div
                        className="mt-4 hidden text-xs text-primary/50 xl:block"
                        aria-hidden="true"
                      >
                        Next step &rarr;
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/onboarding/trip-setup"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
              >
                <span>Start planning your trip</span>
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        {/* 4 Steps for Local Businesses */}
        <section className="border-y border-border/60 bg-card/60 py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center rounded-full bg-teal-navy/10 px-3.5 py-1 text-xs font-semibold text-teal-navy">
                For Local Businesses
              </span>
              <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-teal-navy sm:text-4xl lg:text-5xl">
                Grow with curious travellers
              </h2>
              <p className="mt-3 text-base text-muted-foreground sm:text-lg">
                Join our curated local network in four transparent steps and get
                discovered by visitors looking for genuine experiences.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {businessSteps.map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.number}
                    className="flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-serif text-2xl font-bold text-teal-navy">
                          {step.number}
                        </span>
                        <div className="flex size-11 items-center justify-center rounded-2xl bg-teal-navy text-primary-foreground shadow-xs">
                          <Icon className="size-5" aria-hidden="true" />
                        </div>
                      </div>

                      <h3 className="mt-5 font-serif text-xl font-semibold text-foreground">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                    </div>

                    <div className="mt-6 border-t border-border/60 pt-3">
                      <span className="text-xs font-medium text-primary">
                        Phase {step.number}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-12 rounded-3xl border border-border/70 bg-cream p-6 text-center sm:p-10">
              <div className="mx-auto max-w-xl">
                <h3 className="font-serif text-2xl font-semibold text-teal-navy">
                  Ready to welcome your next guests?
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Get your tour, workshop, culinary experience, or stay listed on
                  Avero. Zero upfront listing fees.
                </p>
                <div className="mt-6">
                  <Link
                    href="/business/register"
                    className="inline-flex items-center gap-2 rounded-full bg-teal-navy px-7 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-teal-navy/90"
                  >
                    <span>Register your business now</span>
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6 Features Grid */}
        <section className="py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center rounded-full bg-amber/20 px-3.5 py-1 text-xs font-semibold text-teal-navy">
                Key Features
              </span>
              <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight text-teal-navy sm:text-4xl lg:text-5xl">
                Built for smart, authentic travel
              </h2>
              <p className="mt-3 text-base text-muted-foreground sm:text-lg">
                Everything you need to discover hidden spots and connect with
                independent local creators.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="group rounded-3xl border border-border/80 bg-card p-7 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
                  >
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="size-6" aria-hidden="true" />
                    </div>
                    <h3 className="mt-5 font-serif text-xl font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Pre-footer CTA */}
        <section className="avero-gradient border-t border-border/50 py-16 text-center sm:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-3xl font-semibold text-teal-navy sm:text-4xl lg:text-5xl">
              Start your personalized journey today
            </h2>
            <p className="mt-4 text-base text-teal-navy/80 sm:text-lg">
              Whether you are discovering new places or sharing your local craft,
              Avero brings travellers and local spots together.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link
                href="/onboarding/trip-setup"
                className="flex h-12 w-full items-center justify-center rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 sm:w-auto"
              >
                Plan my trip
              </Link>
              <Link
                href="/business/register"
                className="flex h-12 w-full items-center justify-center rounded-full border border-teal-navy/20 bg-card/80 px-8 text-base font-semibold text-teal-navy shadow-xs transition-colors hover:bg-card sm:w-auto"
              >
                List your business
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

