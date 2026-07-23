"use client";

import * as React from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { useStore, DEFAULT_SETTINGS } from "@/lib/store";
import { SEED_SUBSCRIPTIONS } from "@/lib/constants";

const GUEST_KEY = "subtraq-guest";

interface AuthContextValue {
  user: User | null;
  isGuest: boolean;
  isAuthed: boolean;
  loading: boolean;
  configured: boolean;
  displayName: string;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signInWithProvider: (provider: "google") => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

const NOT_CONFIGURED_MSG =
  "Accounts aren't set up yet. Add your Supabase keys (see guide.md) or continue as a guest.";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const configured = isSupabaseConfigured();
  const [user, setUser] = React.useState<User | null>(null);
  const [isGuest, setIsGuest] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const replaceAll = useStore((s) => s.replaceAll);
  const settingsName = useStore((s) => s.settings.name);

  React.useEffect(() => {
    setIsGuest(typeof window !== "undefined" && localStorage.getItem(GUEST_KEY) === "1");

    const sb = getSupabase();
    if (!sb) {
      setLoading(false);
      return;
    }

    sb.auth.getSession().then(({ data }) => {
      const sessionUser = data.session?.user ?? null;
      setUser(sessionUser);
      if (sessionUser) {
        localStorage.removeItem(GUEST_KEY);
        setIsGuest(false);
      }
      setLoading(false);
    });

    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);
      if (sessionUser) {
        localStorage.removeItem(GUEST_KEY);
        setIsGuest(false);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = React.useCallback(async (email: string, password: string) => {
    const sb = getSupabase();
    if (!sb) throw new Error(NOT_CONFIGURED_MSG);
    const { error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    localStorage.removeItem(GUEST_KEY);
    setIsGuest(false);
  }, []);

  const signUp = React.useCallback(
    async (email: string, password: string, name?: string) => {
      const sb = getSupabase();
      if (!sb) throw new Error(NOT_CONFIGURED_MSG);
      const { error } = await sb.auth.signUp({
        email,
        password,
        options: { data: name ? { name } : undefined },
      });
      if (error) throw error;
      localStorage.removeItem(GUEST_KEY);
      setIsGuest(false);
    },
    []
  );

  const signInWithProvider = React.useCallback(
    async (provider: "google") => {
      const sb = getSupabase();
      if (!sb) throw new Error(NOT_CONFIGURED_MSG);
      const redirectTo =
        typeof window !== "undefined" ? `${window.location.origin}/dashboard` : undefined;
      const { error } = await sb.auth.signInWithOAuth({
        provider,
        options: { redirectTo },
      });
      if (error) throw error;
    },
    []
  );

  const continueAsGuest = React.useCallback(() => {
    localStorage.setItem(GUEST_KEY, "1");
    setIsGuest(true);
  }, []);

  const signOut = React.useCallback(async () => {
    const sb = getSupabase();
    if (sb) await sb.auth.signOut();
    localStorage.removeItem(GUEST_KEY);
    setIsGuest(false);
    setUser(null);
    replaceAll({ subscriptions: SEED_SUBSCRIPTIONS, activity: [], settings: DEFAULT_SETTINGS });
  }, [replaceAll]);

  const displayName =
    settingsName ||
    (user?.user_metadata?.name as string | undefined) ||
    user?.email?.split("@")[0] ||
    (isGuest ? "Guest" : "");

  const value: AuthContextValue = {
    user,
    isGuest,
    isAuthed: Boolean(user),
    loading,
    configured,
    displayName,
    signIn,
    signUp,
    signInWithProvider,
    signOut,
    continueAsGuest,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
