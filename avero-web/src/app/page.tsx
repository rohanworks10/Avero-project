import Link from "next/link";
import { ArrowRight, Calendar, Compass, Sparkles } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";

const compactSteps = [
  {
    step: "1",
    title: "Tell us your vibe",
    description: "Pick your travel style, budget & pace",
    icon: Sparkles,
  },
  {
    step: "2",
    title: "Get matched",
    description: "Discover curated local gems & businesses",
    icon: Compass,
  },
  {
    step: "3",
    title: "Follow your day-wise plan",
    description: "Enjoy a tailored, realistic itinerary",
    icon: Calendar,
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-cream text-foreground">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="avero-gradient relative overflow-hidden border-b border-border/40 pb-16 pt-14 sm:pb-20 sm:pt-20 lg:pb-24 lg:pt-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              {/* Large Serif Headline */}
              <h1 className="font-serif text-4xl font-semibold tracking-tight text-teal-navy sm:text-6xl lg:text-7xl">
                Your journey. <br className="hidden sm:inline" />
                Your way.
              </h1>

              {/* One Supporting Line */}
              <p className="mt-5 text-base leading-relaxed text-teal-navy/80 sm:text-xl">
                Personalized itineraries matching your vibe, budget, and pace
                with authentic local businesses.
              </p>

              {/* CTAs: Big Plan my trip button and smaller secondary List your business link */}
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
                <Link
                  href="/onboarding/trip-setup"
                  className="flex h-13 w-full items-center justify-center gap-2 rounded-full bg-primary px-8 text-base font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:w-auto"
                >
                  <span>Plan my trip</span>
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>

                <Link
                  href="/business/register"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-navy transition-colors hover:text-primary hover:underline sm:text-base"
                >
                  <span>List your business</span>
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Compact 3-Step Strip */}
        <section className="border-b border-border/50 bg-card/60 py-6 sm:py-8">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
              {compactSteps.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.step}
                    className="flex items-center gap-3.5 rounded-2xl border border-border/60 bg-card p-3.5 shadow-2xs sm:border-0 sm:bg-transparent sm:p-2 sm:shadow-none"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-navy/10 text-teal-navy">
                      <Icon className="size-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-sm font-semibold text-foreground">
                        {item.title}
                      </h2>
                      <p className="truncate text-xs text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/*
          TODO: Local picks row
          Display 3 to 4 cards from getLiveListings() in src/lib/listings.ts (name, area, price range, interest tags).
          Currently skipped as src/lib/listings.ts does not exist yet.
        */}

        {/* Short Business Band */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-6 rounded-3xl border border-border/70 bg-card p-6 shadow-sm sm:flex-row sm:p-8">
              <div className="text-center sm:text-left">
                <span className="inline-flex items-center rounded-full bg-teal-navy/10 px-3 py-1 text-xs font-semibold text-teal-navy">
                  For Local Businesses
                </span>
                <h2 className="mt-2 font-serif text-2xl font-semibold text-teal-navy sm:text-3xl">
                  Reach curious travellers directly
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Get your workshop, tour, authentic food stop, or boutique stay
                  discovered by visitors matching your style.
                </p>
              </div>

              <Link
                href="/business/register"
                className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-teal-navy px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-teal-navy/90"
              >
                <span>Register your business now</span>
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
