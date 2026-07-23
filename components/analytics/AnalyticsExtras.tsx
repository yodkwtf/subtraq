"use client";

import { differenceInMonths } from "date-fns";
import { Crown, Hourglass, Repeat } from "lucide-react";
import { useSpendSummary } from "@/hooks/useSpendSummary";
import { useDisplayCurrency } from "@/hooks/useDisplayCurrency";
import { Card } from "@/components/ui/card";
import { toAnnual } from "@/lib/utils";
import { SubscriptionLogo } from "@/components/subscriptions/SubscriptionLogo";

export function BillingRatioCard() {
  const { billingRatio } = useSpendSummary();
  const total =
    billingRatio.monthly + billingRatio.quarterly + billingRatio.annually || 1;

  const segments = [
    { label: "Monthly", value: billingRatio.monthly, color: "hsl(239 84% 67%)" },
    { label: "Quarterly", value: billingRatio.quarterly, color: "hsl(258 90% 66%)" },
    { label: "Annually", value: billingRatio.annually, color: "hsl(188 86% 53%)" },
  ];

  return (
    <Card className="glass p-5">
      <div className="mb-4 flex items-center gap-2">
        <Repeat className="h-5 w-5 text-primary" />
        <h2 className="font-semibold">Billing cadence</h2>
      </div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-secondary">
        {segments.map((s) =>
          s.value > 0 ? (
            <div
              key={s.label}
              style={{ width: `${(s.value / total) * 100}%`, backgroundColor: s.color }}
              title={`${s.label}: ${s.value}`}
            />
          ) : null
        )}
      </div>
      <ul className="mt-4 grid grid-cols-3 gap-2">
        {segments.map((s) => (
          <li key={s.label} className="rounded-lg bg-secondary/40 p-2.5 text-center">
            <span
              className="mx-auto mb-1 block h-2 w-2 rounded-full"
              style={{ backgroundColor: s.color }}
              aria-hidden
            />
            <p className="text-lg font-bold tabular-nums">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function CalloutCards() {
  const { mostExpensive, longestHeld } = useSpendSummary();
  const { formatDisplay } = useDisplayCurrency();

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card className="glass relative overflow-hidden p-5">
        <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-500/20 blur-2xl" />
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
          <Crown className="h-5 w-5" />
          <h3 className="text-sm font-semibold">Most expensive</h3>
        </div>
        {mostExpensive ? (
          <div className="mt-3 flex items-center gap-3">
            <SubscriptionLogo sub={mostExpensive} size={44} />
            <div>
              <p className="font-semibold">{mostExpensive.name}</p>
              <p className="text-sm text-muted-foreground">
                {formatDisplay(
                  toAnnual(mostExpensive.amount, mostExpensive.billingCycle),
                  mostExpensive.currency
                )}
                /yr
              </p>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">No active subscriptions.</p>
        )}
      </Card>

      <Card className="glass relative overflow-hidden p-5">
        <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[hsl(var(--cyan))]/20 blur-2xl" />
        <div className="flex items-center gap-2 text-[hsl(var(--cyan))]">
          <Hourglass className="h-5 w-5" />
          <h3 className="text-sm font-semibold">Longest held</h3>
        </div>
        {longestHeld ? (
          <div className="mt-3 flex items-center gap-3">
            <SubscriptionLogo sub={longestHeld} size={44} />
            <div>
              <p className="font-semibold">{longestHeld.name}</p>
              <p className="text-sm text-muted-foreground">
                {Math.max(differenceInMonths(new Date(), new Date(longestHeld.startDate)), 0)} months
              </p>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">No active subscriptions.</p>
        )}
      </Card>
    </div>
  );
}
