"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-cream/85 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
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

        {/* Desktop Navigation Links */}
        <nav
          aria-label="Main Navigation"
          className="hidden items-center gap-7 md:flex"
        >
          <Link
            href="/how-it-works"
            className="text-sm font-medium text-teal-navy/80 transition-colors hover:text-teal-navy"
          >
            How it works
          </Link>
          <Link
            href="/onboarding/trip-setup"
            className="text-sm font-medium text-teal-navy/80 transition-colors hover:text-teal-navy"
          >
            Plan a trip
          </Link>
          <Link
            href="/business/register"
            className="text-sm font-medium text-teal-navy/80 transition-colors hover:text-teal-navy"
          >
            For businesses
          </Link>
        </nav>

        {/* Desktop Auth CTAs */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-sm font-medium text-teal-navy transition-colors hover:bg-teal-navy/5 hover:text-teal-navy"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Sign up
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="inline-flex size-10 items-center justify-center rounded-full text-teal-navy transition-colors hover:bg-teal-navy/5 focus-visible:outline-2 focus-visible:outline-ring md:hidden"
        >
          {mobileMenuOpen ? (
            <X className="size-5" aria-hidden="true" />
          ) : (
            <Menu className="size-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="border-b border-border/60 bg-cream/95 px-4 pb-6 pt-3 shadow-lg backdrop-blur-md md:hidden">
          <nav className="flex flex-col space-y-2">
            <Link
              href="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-base font-medium text-teal-navy/90 transition-colors hover:bg-teal-navy/5 hover:text-teal-navy"
            >
              How it works
            </Link>
            <Link
              href="/onboarding/trip-setup"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-base font-medium text-teal-navy/90 transition-colors hover:bg-teal-navy/5 hover:text-teal-navy"
            >
              Plan a trip
            </Link>
            <Link
              href="/business/register"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 text-base font-medium text-teal-navy/90 transition-colors hover:bg-teal-navy/5 hover:text-teal-navy"
            >
              For businesses
            </Link>
            <div className="pt-2">
              <hr className="mb-4 border-border/60" />
              <div className="flex flex-col gap-2.5">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-11 items-center justify-center rounded-full border border-border bg-card text-sm font-medium text-teal-navy shadow-sm transition-colors hover:bg-secondary"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
