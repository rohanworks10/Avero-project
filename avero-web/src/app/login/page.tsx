"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { type UserRole, useAuth } from "@/providers/AuthProvider";

type FieldErrors = {
  email?: string;
  password?: string;
};

const destinations: Record<UserRole, string> = {
  traveller: "/onboarding/trip-setup",
  business: "/business/register",
};

function validateFields(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};

  if (!email.trim()) {
    errors.email = "Please enter your email address.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!password.trim()) {
    errors.password = "Please enter your password.";
  }

  return errors;
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [role, setRole] = useState<UserRole>("traveller");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    const nextErrors = validateFields(email, password);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    login(email.trim(), role);
    router.push(destinations[role]);
  }

  function updateEmail(value: string) {
    setEmail(value);
    if (submitted) setErrors(validateFields(value, password));
  }

  function updatePassword(value: string) {
    setPassword(value);
    if (submitted) setErrors(validateFields(email, value));
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-cream px-0 py-0 sm:px-6 sm:py-6">
      <section className="flex min-h-screen w-full max-w-5xl flex-col overflow-hidden bg-card shadow-sm sm:min-h-[min(52rem,calc(100vh-3rem))] sm:rounded-[2rem] sm:shadow-xl">
        <header className="avero-gradient relative flex flex-col items-center px-6 pb-8 pt-14 text-center sm:pb-9 sm:pt-16">
          <div
            aria-hidden="true"
            className="mb-4 flex size-12 items-center justify-center rounded-xl bg-teal-navy shadow-sm"
          >
            <svg viewBox="0 0 32 32" className="size-8" fill="none">
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
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-teal-navy">
            Avero
          </h1>
          <p className="mt-1 text-xs text-teal-navy/70">
            Your journey, your way.
          </p>
        </header>

        <div className="mx-auto w-full max-w-[424px] flex-1 px-6 pb-10 pt-1 sm:px-8 sm:pt-0">
          <div
            aria-label="Choose your account type"
            className="mb-5 grid grid-cols-2 rounded-full bg-secondary p-1"
            role="group"
          >
            {(["traveller", "business"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={role === option}
                onClick={() => setRole(option)}
                className={`h-9 rounded-full text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                  role === option
                    ? "bg-card text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {option === "traveller" ? "Traveller" : "Business"}
              </button>
            ))}
          </div>

          <div className="mb-5">
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-foreground">
              Welcome back
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Log in to continue your journey.
            </p>
          </div>

          <form className="space-y-3" noValidate onSubmit={handleSubmit}>
            <div>
              <label className="sr-only" htmlFor="login-email">
                Email address
              </label>
              <div
                className={`flex h-12 items-center gap-3 rounded-full border bg-cream/60 px-4 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/20 ${
                  errors.email ? "border-destructive" : "border-border"
                }`}
              >
                <Mail aria-hidden="true" className="size-4 shrink-0 text-teal-navy" />
                <input
                  autoComplete="email"
                  className="h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  id="login-email"
                  name="email"
                  onBlur={() => {
                    const nextErrors = validateFields(email, password);
                    setErrors((current) => ({
                      ...current,
                      email: nextErrors.email,
                    }));
                  }}
                  onChange={(event) => updateEmail(event.target.value)}
                  placeholder="Email address"
                  type="email"
                  value={email}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "login-email-error" : undefined}
                />
              </div>
              {errors.email && (
                <p
                  className="px-4 pt-1.5 text-xs text-destructive"
                  id="login-email-error"
                  role="alert"
                >
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="sr-only" htmlFor="login-password">
                Password
              </label>
              <div
                className={`flex h-12 items-center gap-3 rounded-full border bg-cream/60 px-4 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/20 ${
                  errors.password ? "border-destructive" : "border-border"
                }`}
              >
                <LockKeyhole
                  aria-hidden="true"
                  className="size-4 shrink-0 text-teal-navy"
                />
                <input
                  autoComplete="current-password"
                  className="h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  id="login-password"
                  name="password"
                  onBlur={() => {
                    const nextErrors = validateFields(email, password);
                    setErrors((current) => ({
                      ...current,
                      password: nextErrors.password,
                    }));
                  }}
                  onChange={(event) => updatePassword(event.target.value)}
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password ? "login-password-error" : undefined
                  }
                />
                <button
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="flex size-7 shrink-0 items-center justify-center rounded-full text-teal-navy transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-ring"
                  onClick={() => setShowPassword((visible) => !visible)}
                  type="button"
                >
                  {showPassword ? (
                    <EyeOff aria-hidden="true" className="size-4" />
                  ) : (
                    <Eye aria-hidden="true" className="size-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p
                  className="px-4 pt-1.5 text-xs text-destructive"
                  id="login-password-error"
                  role="alert"
                >
                  {errors.password}
                </p>
              )}
            </div>

            <button
              className="mt-2 h-12 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              type="submit"
            >
              Log in
            </button>
          </form>

          <div className="my-5 flex items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">OR</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <a
              className="font-medium text-primary underline-offset-4 hover:underline"
              href="/signup"
            >
              Sign up
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
