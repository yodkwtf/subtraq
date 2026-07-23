"use client";

import * as React from "react";
import { useAuth } from "./auth-context";
import { useStore, DEFAULT_SETTINGS } from "@/lib/store";
import { SEED_SUBSCRIPTIONS } from "@/lib/constants";
import { loadCloudData, saveCloudData } from "@/lib/cloud";

/**
 * For signed-in users, loads their data from Supabase and persists changes back
 * (debounced). Guests and unconfigured installs fall through to local storage.
 */
export function useCloudSync(): { ready: boolean } {
  const { user, configured, loading } = useAuth();
  const replaceAll = useStore((s) => s.replaceAll);
  const ready = useStore((s) => s.cloudReady);
  const setReady = useStore((s) => s.setCloudReady);
  const userId = user?.id ?? null;

  React.useEffect(() => {
    if (loading) return;
    if (!configured || !userId) {
      setReady(true);
      return;
    }

    let cancelled = false;
    setReady(false);
    (async () => {
      const data = await loadCloudData(userId);
      if (cancelled) return;
      if (data) {
        replaceAll(data);
      } else {
        const seed = {
          subscriptions: SEED_SUBSCRIPTIONS,
          activity: [],
          settings: DEFAULT_SETTINGS,
        };
        replaceAll(seed);
        await saveCloudData(userId, seed);
      }
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, configured, loading, replaceAll, setReady]);

  React.useEffect(() => {
    if (!configured || !userId || !ready) return;
    let timer: ReturnType<typeof setTimeout>;
    const unsub = useStore.subscribe((state) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        void saveCloudData(userId, {
          subscriptions: state.subscriptions,
          activity: state.activity,
          settings: state.settings,
        });
      }, 800);
    });
    return () => {
      clearTimeout(timer);
      unsub();
    };
  }, [userId, configured, ready]);

  return { ready };
}
