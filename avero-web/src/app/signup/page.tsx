"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LockKeyhole, Mail, User as UserIcon } from "lucide-react";
import { type UserRole, useAuth } from "@/providers/AuthProvider";

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

const destinations: Record<UserRole, string> = {
  traveller: "/onboarding/trip-setup",
  business: "/business/register",
};

function validateFields(
  name: string,
  email: string,
  password: string,
  confirmPassword: string
): FieldErrors {
  const errors: FieldErrors = {};

  if (!name.trim()) {
    errors.name = "Please enter your full name.";
  }

  if (!email.trim()) {
    errors.email = "Please enter your email address.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!password) {
    errors.password = "Please enter your password.";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (confirmPassword !== password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

function SignupContent() {
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");
  const initialRole: UserRole =
    roleParam === "business" ? "business" : "traveller";

  return <SignupForm key={initialRole} defaultRole={initialRole} />;
}

function SignupForm({ defaultRole }: { defaultRole: UserRole }) {
  const router = useRouter();
  const { signup } = useAuth();
  const [role, setRole] = useState<UserRole>(defaultRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    const nextErrors = validateFields(name, email, password, confirmPassword);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    signup(name.trim(), email.trim(), role);
    router.push(destinations[role]);
  }

  function updateName(value: string) {
    setName(value);
    if (submitted) {
      setErrors(validateFields(value, email, password, confirmPassword));
    } else if (errors.name) {
      const nextErrors = validateFields(value, email, password, confirmPassword);
      setErrors((current) => ({ ...current, name: nextErrors.name }));
    }
  }

  function updateEmail(value: string) {
    setEmail(value);
    if (submitted) {
      setErrors(validateFields(name, value, password, confirmPassword));
    } else if (errors.email) {
      const nextErrors = validateFields(name, value, password, confirmPassword);
      setErrors((current) => ({ ...current, email: nextErrors.email }));
    }
  }

  function updatePassword(value: string) {
    setPassword(value);
    if (submitted) {
      setErrors(validateFields(name, email, value, confirmPassword));
    } else if (errors.password || errors.confirmPassword) {
      const nextErrors = validateFields(name, email, value, confirmPassword);
      setErrors((current) => ({
        ...current,
        password: nextErrors.password,
        confirmPassword: confirmPassword ? nextErrors.confirmPassword : current.confirmPassword,
      }));
    }
  }

  function updateConfirmPassword(value: string) {
    setConfirmPassword(value);
    if (submitted) {
      setErrors(validateFields(name, email, password, value));
    } else if (errors.confirmPassword) {
      const nextErrors = validateFields(name, email, password, value);
      setErrors((current) => ({
        ...current,
        confirmPassword: nextErrors.confirmPassword,
      }));
    }
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
              Create an account
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign up to get started with your journey.
            </p>
          </div>

          <form className="space-y-3" noValidate onSubmit={handleSubmit}>
            <div>
              <label className="sr-only" htmlFor="signup-name">
                Full name
              </label>
              <div
                className={`flex h-12 items-center gap-3 rounded-full border bg-cream/60 px-4 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/20 ${
                  errors.name ? "border-destructive" : "border-border"
                }`}
              >
                <UserIcon
                  aria-hidden="true"
                  className="size-4 shrink-0 text-teal-navy"
                />
                <input
                  autoComplete="name"
                  className="h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  id="signup-name"
                  name="name"
                  onBlur={() => {
                    const nextErrors = validateFields(
                      name,
                      email,
                      password,
                      confirmPassword
                    );
                    setErrors((current) => ({
                      ...current,
                      name: nextErrors.name,
                    }));
                  }}
                  onChange={(event) => updateName(event.target.value)}
                  placeholder="Full name"
                  type="text"
                  value={name}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={
                    errors.name ? "signup-name-error" : undefined
                  }
                />
              </div>
              {errors.name && (
                <p
                  className="px-4 pt-1.5 text-xs text-destructive"
                  id="signup-name-error"
                  role="alert"
                >
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="sr-only" htmlFor="signup-email">
                Email address
              </label>
              <div
                className={`flex h-12 items-center gap-3 rounded-full border bg-cream/60 px-4 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/20 ${
                  errors.email ? "border-destructive" : "border-border"
                }`}
              >
                <Mail
                  aria-hidden="true"
                  className="size-4 shrink-0 text-teal-navy"
                />
                <input
                  autoComplete="email"
                  className="h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  id="signup-email"
                  name="email"
                  onBlur={() => {
                    const nextErrors = validateFields(
                      name,
                      email,
                      password,
                      confirmPassword
                    );
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
                  aria-describedby={
                    errors.email ? "signup-email-error" : undefined
                  }
                />
              </div>
              {errors.email && (
                <p
                  className="px-4 pt-1.5 text-xs text-destructive"
                  id="signup-email-error"
                  role="alert"
                >
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="sr-only" htmlFor="signup-password">
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
                  autoComplete="new-password"
                  className="h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  id="signup-password"
                  name="password"
                  onBlur={() => {
                    const nextErrors = validateFields(
                      name,
                      email,
                      password,
                      confirmPassword
                    );
                    setErrors((current) => ({
                      ...current,
                      password: nextErrors.password,
                      ...(confirmPassword
                        ? { confirmPassword: nextErrors.confirmPassword }
                        : {}),
                    }));
                  }}
                  onChange={(event) => updatePassword(event.target.value)}
                  placeholder="Password (8+ characters)"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password ? "signup-password-error" : undefined
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
                  id="signup-password-error"
                  role="alert"
                >
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <label className="sr-only" htmlFor="signup-confirm-password">
                Confirm password
              </label>
              <div
                className={`flex h-12 items-center gap-3 rounded-full border bg-cream/60 px-4 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/20 ${
                  errors.confirmPassword ? "border-destructive" : "border-border"
                }`}
              >
                <LockKeyhole
                  aria-hidden="true"
                  className="size-4 shrink-0 text-teal-navy"
                />
                <input
                  autoComplete="new-password"
                  className="h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  id="signup-confirm-password"
                  name="confirmPassword"
                  onBlur={() => {
                    const nextErrors = validateFields(
                      name,
                      email,
                      password,
                      confirmPassword
                    );
                    setErrors((current) => ({
                      ...current,
                      confirmPassword: nextErrors.confirmPassword,
                    }));
                  }}
                  onChange={(event) => updateConfirmPassword(event.target.value)}
                  placeholder="Confirm password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  aria-invalid={Boolean(errors.confirmPassword)}
                  aria-describedby={
                    errors.confirmPassword
                      ? "signup-confirm-password-error"
                      : undefined
                  }
                />
                <button
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                  className="flex size-7 shrink-0 items-center justify-center rounded-full text-teal-navy transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-ring"
                  onClick={() => setShowConfirmPassword((visible) => !visible)}
                  type="button"
                >
                  {showConfirmPassword ? (
                    <EyeOff aria-hidden="true" className="size-4" />
                  ) : (
                    <Eye aria-hidden="true" className="size-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p
                  className="px-4 pt-1.5 text-xs text-destructive"
                  id="signup-confirm-password-error"
                  role="alert"
                >
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              className="mt-2 h-12 w-full rounded-full bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              type="submit"
            >
              Sign up
            </button>
          </form>

          <div className="my-5 flex items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">OR</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              className="font-medium text-primary underline-offset-4 hover:underline"
              href="/login"
            >
              Log in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupContent />
    </Suspense>
  );
}
