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

export type UserRole = "traveller" | "business";

export type User = {
  name: string;
  email: string;
  role: UserRole;
};

type AuthContextValue = {
  user: User | null;
  login: (email: string, role?: UserRole) => void;
  signup: (name: string, email: string, role: UserRole) => void;
  logout: () => void;
};

const STORAGE_KEY = "avero-user";

const AuthContext = createContext<AuthContextValue | null>(null);

function isUser(value: unknown): value is User {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.name === "string" &&
    typeof record.email === "string" &&
    (record.role === "traveller" || record.role === "business")
  );
}

function readStoredUser(): User | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed: unknown = JSON.parse(stored);
    return isUser(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeStoredUser(user: User | null) {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Storage can be unavailable in private mode or during SSR.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = readStoredUser();
    if (stored) setUser(stored);
  }, []);

  const login = useCallback((email: string, role: UserRole = "traveller") => {
    const stored = readStoredUser();
    if (stored?.email === email) {
      setUser(stored);
      return;
    }

    const name = email.split("@")[0] || "Traveller";
    const next: User = { name, email, role };
    setUser(next);
    writeStoredUser(next);
  }, []);

  const signup = useCallback((name: string, email: string, role: UserRole) => {
    const next: User = { name, email, role };
    setUser(next);
    writeStoredUser(next);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    writeStoredUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, login, signup, logout }),
    [user, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
