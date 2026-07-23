"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { toMonthly, toAnnual, daysUntil } from "@/lib/utils";
import { convert, FALLBACK_RATES_USD } from "@/lib/fx";
import type { Category, Subscription } from "@/lib/types";
import { CATEGORIES } from "@/lib/constants";
import { subMonths, format, isWithinInterval, startOfMonth, endOfMonth } from "date-fns";

export interface SpendSummary {
  monthlyTotal: number;
  annualTotal: number;
  activeCount: number;
  pausedCount: number;
  cancelledCount: number;
  nextRenewal: { sub: Subscription; days: number } | null;
  categoryBreakdown: { category: Category; monthly: number; count: number }[];
  monthlySeries: { month: string; amount: number }[];
  billingRatio: { monthly: number; quarterly: number; annually: number };
  mostExpensive: Subscription | null;
  longestHeld: Subscription | null;
}

/**
 * All totals are normalised into the user's display currency using FX rates, so
 * a mix of (e.g.) INR and USD subscriptions sum correctly instead of being
 * naively added together.
 */
export function useSpendSummary(): SpendSummary {
  const subscriptions = useStore((s) => s.subscriptions);
  const displayCurrency = useStore((s) => s.settings.currency);
  const fxRates = useStore((s) => s.fxRates);

  return useMemo(() => {
    const rates = fxRates ?? FALLBACK_RATES_USD;
    const inDisplay = (s: Subscription) =>
      convert(s.amount, s.currency, displayCurrency, rates);
    const monthlyIn = (s: Subscription) => toMonthly(inDisplay(s), s.billingCycle);
    const annualIn = (s: Subscription) => toAnnual(inDisplay(s), s.billingCycle);

    const active = subscriptions.filter((s) => s.status === "Active");

    const monthlyTotal = active.reduce((sum, s) => sum + monthlyIn(s), 0);
    const annualTotal = active.reduce((sum, s) => sum + annualIn(s), 0);

    const upcoming = active
      .map((s) => ({ sub: s, days: daysUntil(s.nextRenewalDate) }))
      .filter((x) => x.days >= 0)
      .sort((a, b) => a.days - b.days);
    const nextRenewal = upcoming[0] ?? null;

    const categoryBreakdown = CATEGORIES.map((category) => {
      const subs = active.filter((s) => s.category === category);
      const monthly = subs.reduce((sum, s) => sum + monthlyIn(s), 0);
      return { category, monthly, count: subs.length };
    }).filter((c) => c.count > 0);

    // Real 12-month trend: a subscription only contributes to a month once it
    // had actually started, so the line reflects how the stack grew over time.
    const now = new Date();
    const monthlySeries = Array.from({ length: 12 }).map((_, i) => {
      const monthDate = subMonths(now, 11 - i);
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);

      let amount = 0;
      for (const s of active) {
        if (new Date(s.startDate) > end) continue;
        const converted = inDisplay(s);
        amount += toMonthly(converted, s.billingCycle);
        if (s.billingCycle !== "Monthly") {
          const renewal = new Date(s.nextRenewalDate);
          if (isWithinInterval(renewal, { start, end })) {
            amount += converted - toMonthly(converted, s.billingCycle);
          }
        }
      }
      return { month: format(monthDate, "MMM"), amount: Math.round(amount * 100) / 100 };
    });

    const billingRatio = active.reduce(
      (acc, s) => {
        if (s.billingCycle === "Monthly") acc.monthly += 1;
        else if (s.billingCycle === "Quarterly") acc.quarterly += 1;
        else acc.annually += 1;
        return acc;
      },
      { monthly: 0, quarterly: 0, annually: 0 }
    );

    const mostExpensive =
      active.length > 0
        ? active.reduce((max, s) => (monthlyIn(s) > monthlyIn(max) ? s : max))
        : null;

    const longestHeld =
      active.length > 0
        ? active.reduce((oldest, s) =>
            new Date(s.startDate) < new Date(oldest.startDate) ? s : oldest
          )
        : null;

    return {
      monthlyTotal,
      annualTotal,
      activeCount: active.length,
      pausedCount: subscriptions.filter((s) => s.status === "Paused").length,
      cancelledCount: subscriptions.filter((s) => s.status === "Cancelled").length,
      nextRenewal,
      categoryBreakdown,
      monthlySeries,
      billingRatio,
      mostExpensive,
      longestHeld,
    };
  }, [subscriptions, displayCurrency, fxRates]);
}
