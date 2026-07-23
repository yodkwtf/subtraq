import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Subscription, ActivityItem, Settings, ActivityType } from "./types";
import type { FxRates } from "./fx";
import { SEED_SUBSCRIPTIONS, DEFAULT_CURRENCY } from "./constants";
import { uid, normalizeName } from "./utils";
import { nextRenewalOnOrAfter } from "./dates";

/**
 * Active subscriptions auto-renew, so a renewal date that has slipped into the
 * past just means it rolled over. Advance it to the next cycle on/after today so
 * the UI never shows a live subscription as perpetually "overdue".
 */
function rollForwardRenewal(sub: Subscription): Subscription {
  if (sub.status !== "Active") return sub;
  const next = nextRenewalOnOrAfter(sub.nextRenewalDate, sub.billingCycle);
  return next === sub.nextRenewalDate ? sub : { ...sub, nextRenewalDate: next };
}

export const DEFAULT_SETTINGS: Settings = {
  currency: DEFAULT_CURRENCY,
  reminderThreshold: 7,
};

interface SubscriptionState {
  subscriptions: Subscription[];
  activity: ActivityItem[];
  settings: Settings;
  hydrated: boolean;
  cloudReady: boolean;
  /** User ids that have dismissed the sample-data banner (per-account). */
  dismissedSampleUsers: string[];
  fxRates: FxRates | null;
  fxUpdatedAt: string | null;
  setFxRates: (rates: FxRates, updatedAt: string | null) => void;
  setSampleDismissed: (userId: string, dismissed: boolean) => void;

  addSubscription: (sub: Omit<Subscription, "id">) => string | null;
  updateSubscription: (id: string, patch: Partial<Subscription>) => void;
  deleteSubscription: (id: string) => void;
  archiveSubscription: (id: string) => void;
  setStatus: (id: string, status: Subscription["status"]) => void;

  updateSettings: (patch: Partial<Settings>) => void;

  importData: (data: { subscriptions: Subscription[]; settings?: Settings }) => void;
  loadSampleData: () => void;
  clearAll: () => void;
  replaceAll: (data: {
    subscriptions: Subscription[];
    activity?: ActivityItem[];
    settings?: Settings;
  }) => void;
  rollForwardRenewals: () => void;
  setHydrated: (v: boolean) => void;
  setCloudReady: (v: boolean) => void;
}

function logActivity(
  activity: ActivityItem[],
  type: ActivityType,
  name: string
): ActivityItem[] {
  const entry: ActivityItem = {
    id: uid(),
    type,
    subscriptionName: name,
    timestamp: new Date().toISOString(),
  };
  return [entry, ...activity].slice(0, 30);
}

export const useStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      subscriptions: SEED_SUBSCRIPTIONS,
      activity: [],
      settings: DEFAULT_SETTINGS,
      hydrated: false,
      cloudReady: false,
      dismissedSampleUsers: [],
      fxRates: null,
      fxUpdatedAt: null,

      setFxRates: (rates, updatedAt) => set({ fxRates: rates, fxUpdatedAt: updatedAt }),

      setSampleDismissed: (userId, dismissed) =>
        set((state) => ({
          dismissedSampleUsers: dismissed
            ? Array.from(new Set([...state.dismissedSampleUsers, userId]))
            : state.dismissedSampleUsers.filter((id) => id !== userId),
        })),

      addSubscription: (sub) => {
        const exists = get().subscriptions.some(
          (s) => s.status !== "Cancelled" && normalizeName(s.name) === normalizeName(sub.name)
        );
        if (exists) return null;

        const id = uid();
        const newSub: Subscription = { ...sub, id };
        set((state) => ({
          subscriptions: [newSub, ...state.subscriptions],
          activity: logActivity(state.activity, "added", sub.name),
        }));
        return id;
      },

      updateSubscription: (id, patch) => {
        set((state) => {
          const existing = state.subscriptions.find((s) => s.id === id);
          return {
            subscriptions: state.subscriptions.map((s) =>
              s.id === id ? { ...s, ...patch } : s
            ),
            activity: existing
              ? logActivity(state.activity, "edited", patch.name ?? existing.name)
              : state.activity,
          };
        });
      },

      deleteSubscription: (id) => {
        set((state) => {
          const existing = state.subscriptions.find((s) => s.id === id);
          return {
            subscriptions: state.subscriptions.filter((s) => s.id !== id),
            activity: existing
              ? logActivity(state.activity, "cancelled", existing.name)
              : state.activity,
          };
        });
      },

      archiveSubscription: (id) => {
        set((state) => {
          const existing = state.subscriptions.find((s) => s.id === id);
          return {
            subscriptions: state.subscriptions.map((s) =>
              s.id === id ? { ...s, status: "Cancelled" } : s
            ),
            activity: existing
              ? logActivity(state.activity, "cancelled", existing.name)
              : state.activity,
          };
        });
      },

      setStatus: (id, status) => {
        set((state) => {
          const existing = state.subscriptions.find((s) => s.id === id);
          const type: ActivityType =
            status === "Paused" ? "paused" : status === "Active" ? "resumed" : "cancelled";
          return {
            subscriptions: state.subscriptions.map((s) =>
              s.id === id ? { ...s, status } : s
            ),
            activity: existing
              ? logActivity(state.activity, type, existing.name)
              : state.activity,
          };
        });
      },

      updateSettings: (patch) =>
        set((state) => ({ settings: { ...state.settings, ...patch } })),

      importData: (data) =>
        set((state) => ({
          subscriptions: data.subscriptions ?? state.subscriptions,
          settings: data.settings ?? state.settings,
          activity: logActivity(state.activity, "added", "Imported data"),
        })),

      loadSampleData: () =>
        set((state) => ({
          subscriptions: SEED_SUBSCRIPTIONS,
          activity: logActivity(state.activity, "added", "Sample data"),
        })),

      clearAll: () =>
        set({
          subscriptions: [],
          activity: [],
          settings: DEFAULT_SETTINGS,
        }),

      replaceAll: ({ subscriptions, activity, settings }) =>
        set((state) => ({
          subscriptions,
          activity: activity ?? [],
          settings: settings ?? state.settings,
        })),

      rollForwardRenewals: () =>
        set((state) => {
          const subscriptions = state.subscriptions.map(rollForwardRenewal);
          const changed = subscriptions.some((s, i) => s !== state.subscriptions[i]);
          return changed ? { subscriptions } : {};
        }),

      setHydrated: (v) => set({ hydrated: v }),

      setCloudReady: (v) => set({ cloudReady: v }),
    }),
    {
      name: "subtraq-v1",
      partialize: (state) => ({
        subscriptions: state.subscriptions,
        activity: state.activity,
        settings: state.settings,
        fxRates: state.fxRates,
        fxUpdatedAt: state.fxUpdatedAt,
        dismissedSampleUsers: state.dismissedSampleUsers,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
        // Bring any active subscription whose renewal has passed up to date.
        state?.rollForwardRenewals();
      },
    }
  )
);
