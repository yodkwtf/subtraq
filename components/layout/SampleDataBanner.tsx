"use client";

import { Sparkles, X } from "lucide-react";
import { useAuth } from "@/components/auth/auth-context";
import { useStore } from "@/lib/store";
import { SEED_IDS } from "@/lib/constants";
import { useToast } from "@/components/ui/toast";

/**
 * Shown to signed-in users while they're still on the seeded sample data (i.e.
 * they haven't added anything of their own yet), with a one-click way to wipe it
 * and start fresh. Guests get their own banner; this one is for real accounts.
 *
 * Dismissal is tracked per-account in the store, so it's remembered for that
 * user and reappears if they load the sample data again (see Settings restore).
 */
export function SampleDataBanner() {
  const { isAuthed, isGuest, user } = useAuth();
  const userId = user?.id;
  const subscriptions = useStore((s) => s.subscriptions);
  const cloudReady = useStore((s) => s.cloudReady);
  const dismissedUsers = useStore((s) => s.dismissedSampleUsers);
  const replaceAll = useStore((s) => s.replaceAll);
  const setSampleDismissed = useStore((s) => s.setSampleDismissed);
  const { toast } = useToast();

  const dismissed = userId ? dismissedUsers.includes(userId) : false;

  // Sample data = a non-empty set where every item is a seed subscription.
  const isSample =
    subscriptions.length > 0 && subscriptions.every((s) => SEED_IDS.has(s.id));

  // cloudReady gates against flashing this before the user's real data loads.
  if (!isAuthed || isGuest || !cloudReady || !isSample || dismissed) return null;

  const handleClear = () => {
    // Wipe the sample subscriptions/activity but keep the user's preferences.
    replaceAll({ subscriptions: [], activity: [] });
    toast({
      title: "Sample data cleared",
      description: "Add your first subscription to get started.",
      variant: "info",
    });
  };

  const handleDismiss = () => {
    if (userId) setSampleDismissed(userId, true);
  };

  return (
    <div className="flex items-center justify-center gap-2 border-b border-primary/20 bg-primary/5 px-4 py-2 text-center text-xs text-muted-foreground">
      <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary" />
      <span>
        You&apos;re viewing{" "}
        <span className="font-medium text-foreground">sample data</span> so you can explore.{" "}
        <button
          type="button"
          onClick={handleClear}
          className="font-medium text-primary hover:underline focus-ring"
        >
          Clear it
        </button>{" "}
        to start fresh with your own subscriptions.
      </span>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss"
        className="ml-1 rounded p-0.5 text-muted-foreground/70 transition-colors hover:text-foreground focus-ring"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
