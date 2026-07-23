"use client";

import * as React from "react";
import { useStore } from "@/lib/store";
import { daysUntil, urgencyLabel } from "@/lib/utils";

const SEEN_KEY = "subtraq-reminded";

/**
 * Browser-notification reminders for renewals within the user's threshold. Fires
 * at most once per subscription per day while the app is open. Renders nothing.
 *
 * True email / closed-app push needs a backend mail/push service (see guide.md);
 * this covers the in-app reminder side without any server.
 */
export function RenewalReminders() {
  const subscriptions = useStore((s) => s.subscriptions);
  const threshold = useStore((s) => s.settings.reminderThreshold);
  const enabled = useStore((s) => s.settings.notifyRenewals);

  React.useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const today = new Date().toISOString().slice(0, 10);
    let seen: Record<string, string> = {};
    try {
      seen = JSON.parse(localStorage.getItem(SEEN_KEY) || "{}");
    } catch {
      seen = {};
    }

    let changed = false;
    for (const sub of subscriptions) {
      if (sub.status !== "Active") continue;
      const days = daysUntil(sub.nextRenewalDate);
      if (days < 0 || days > threshold) continue;
      if (seen[sub.id] === today) continue;

      try {
        new Notification("Upcoming renewal", {
          body: `${sub.name} renews ${urgencyLabel(days).toLowerCase()}.`,
          icon: "/logo.svg",
          tag: `renewal-${sub.id}`,
        });
        seen[sub.id] = today;
        changed = true;
      } catch {
        // Ignore notification failures (e.g. permission revoked mid-session).
      }
    }

    if (changed) {
      try {
        localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
      } catch {
        // Storage full / unavailable: reminders simply repeat next session.
      }
    }
  }, [subscriptions, threshold, enabled]);

  return null;
}
