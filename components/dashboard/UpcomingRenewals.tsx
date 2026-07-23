"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";
import { CalendarClock } from "lucide-react";
import { useStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { daysUntil, renewalUrgency, urgencyLabel, cn } from "@/lib/utils";
import { useDisplayCurrency } from "@/hooks/useDisplayCurrency";
import type { Urgency } from "@/lib/utils";
import { SubscriptionLogo } from "@/components/subscriptions/SubscriptionLogo";
import { useEditor } from "@/components/editor-context";

const URGENCY_STYLES: Record<Urgency, { dot: string; text: string; ring: string }> = {
  overdue: { dot: "bg-red-500", text: "text-red-600 dark:text-red-400", ring: "ring-red-500/30" },
  red: { dot: "bg-red-500", text: "text-red-600 dark:text-red-400", ring: "ring-red-500/30" },
  yellow: { dot: "bg-amber-400", text: "text-amber-600 dark:text-amber-400", ring: "ring-amber-400/30" },
  green: { dot: "bg-emerald-400", text: "text-emerald-600 dark:text-emerald-400", ring: "ring-emerald-400/30" },
};

export function UpcomingRenewals() {
  const subscriptions = useStore((s) => s.subscriptions);
  const threshold = useStore((s) => s.settings.reminderThreshold);
  const { openEdit } = useEditor();
  const { formatDisplay } = useDisplayCurrency();

  const upcoming = subscriptions
    .filter((s) => s.status === "Active")
    .map((s) => ({ sub: s, days: daysUntil(s.nextRenewalDate) }))
    .sort((a, b) => a.days - b.days)
    .slice(0, 6);

  return (
    <Card className="glass overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/60 p-5">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">Upcoming renewals</h2>
        </div>
        <span className="text-xs text-muted-foreground">Next {upcoming.length}</span>
      </div>

      {upcoming.length === 0 ? (
        <p className="p-8 text-center text-sm text-muted-foreground">
          No active subscriptions yet. Add one to see renewals here.
        </p>
      ) : (
        <ul className="divide-y divide-border/50">
          {upcoming.map(({ sub, days }, i) => {
            const urgency = renewalUrgency(sub.nextRenewalDate, threshold);
            const style = URGENCY_STYLES[urgency];
            return (
              <motion.li
                key={sub.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <button
                  onClick={() => openEdit(sub)}
                  className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-secondary/40 focus-ring"
                >
                  <SubscriptionLogo
                    sub={sub}
                    size={40}
                    className={cn("ring-1", style.ring)}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate font-medium">{sub.name}</span>
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(sub.nextRenewalDate), "MMM d, yyyy")}
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="block text-sm font-semibold tabular-nums">
                      {formatDisplay(sub.amount, sub.currency)}
                    </span>
                    <span className={cn("flex items-center justify-end gap-1.5 text-xs font-medium", style.text)}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} aria-hidden />
                      {urgencyLabel(days)}
                    </span>
                  </span>
                </button>
              </motion.li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
