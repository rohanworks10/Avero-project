import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/70 bg-card text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          {/* Brand */}
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div
                aria-hidden="true"
                className="flex size-7 items-center justify-center rounded-lg bg-teal-navy shadow-sm"
              >
                <svg viewBox="0 0 32 32" className="size-4" fill="none">
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
              <span className="font-serif text-xl font-semibold tracking-tight text-teal-navy">
                Avero
              </span>
            </Link>
            <p className="text-xs text-muted-foreground">
              Your journey, your way.
            </p>
          </div>

          {/* Navigation Links - Every link goes to a real page */}
          <nav
            aria-label="Footer Navigation"
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
          >
            <Link
              href="/how-it-works"
              className="transition-colors hover:text-foreground"
            >
              How it works
            </Link>
            <Link
              href="/onboarding/trip-setup"
              className="transition-colors hover:text-foreground"
            >
              Plan a trip
            </Link>
            <Link
              href="/discover"
              className="transition-colors hover:text-foreground"
            >
              Discover
            </Link>
            <Link
              href="/trips"
              className="transition-colors hover:text-foreground"
            >
              My trips
            </Link>
            <Link
              href="/business/register"
              className="transition-colors hover:text-foreground"
            >
              For businesses
            </Link>
            <Link
              href="/login"
              className="transition-colors hover:text-foreground"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="transition-colors hover:text-foreground"
            >
              Sign up
            </Link>
          </nav>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground">
            &copy; 2026 Avero. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
