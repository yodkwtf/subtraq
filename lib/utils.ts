import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { differenceInCalendarDays, parseISO, isValid } from "date-fns";
import type { BillingCycle, Subscription } from "./types";
import { CURRENCY_SYMBOLS, DEFAULT_CURRENCY } from "./constants";
import type { CurrencyCode } from "./types";

// Date helpers live in ./dates (no dependency on constants, so the seed data can
// use them too). Re-exported here for existing import sites.
export { renewalFromCycle, todayISO, nextRenewalOnOrAfter } from "./dates";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** A lightweight uuid (crypto when available, fallback otherwise) */
export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "id-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/** Normalise any billing cycle to a monthly-equivalent amount */
export function toMonthly(amount: number, cycle: BillingCycle): number {
  switch (cycle) {
    case "Monthly":
      return amount;
    case "Quarterly":
      return amount / 3;
    case "Annually":
      return amount / 12;
    default:
      return amount;
  }
}

export function toAnnual(amount: number, cycle: BillingCycle): number {
  return toMonthly(amount, cycle) * 12;
}

/** The period a cycle bills over, as a noun (so "per month", not "per monthly"). */
export function billingPeriod(cycle: BillingCycle): string {
  if (cycle === "Annually") return "year";
  if (cycle === "Quarterly") return "quarter";
  return "month";
}

export function formatCurrency(
  amount: number,
  currency: CurrencyCode | string = DEFAULT_CURRENCY,
  opts: { compact?: boolean } = {}
): string {
  const code = (currency in CURRENCY_SYMBOLS ? currency : DEFAULT_CURRENCY) as CurrencyCode;
  const locale = code === "INR" ? "en-IN" : "en-US";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
      maximumFractionDigits: opts.compact ? 0 : 2,
      notation: opts.compact ? "compact" : "standard",
    }).format(amount);
  } catch {
    const symbol = CURRENCY_SYMBOLS[code] ?? "₹";
    return `${symbol}${amount.toFixed(2)}`;
  }
}

export function currencySymbol(currency: CurrencyCode | string): string {
  return CURRENCY_SYMBOLS[currency as CurrencyCode] ?? "₹";
}

/** Lower-cased, trimmed name for duplicate detection. */
export function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Days until a renewal date (negative if past). Safe against bad input. */
export function daysUntil(isoDate: string): number {
  const d = parseISO(isoDate);
  if (!isValid(d)) return 0;
  return differenceInCalendarDays(d, new Date());
}

export type Urgency = "overdue" | "red" | "yellow" | "green";

export function renewalUrgency(isoDate: string, threshold = 7): Urgency {
  const days = daysUntil(isoDate);
  if (days < 0) return "overdue";
  if (days <= 3) return "red";
  if (days <= threshold) return "yellow";
  return "green";
}

export function urgencyLabel(days: number): string {
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `in ${days} days`;
}

/** Simple fuzzy match: every char of query appears in order in target. */
export function fuzzyMatch(query: string, target: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const t = target.toLowerCase();
  let i = 0;
  for (const ch of t) {
    if (ch === q[i]) i++;
    if (i === q.length) return true;
  }
  return i === q.length;
}

export function activeMonthlySpend(subs: Subscription[]): number {
  return subs
    .filter((s) => s.status === "Active")
    .reduce((sum, s) => sum + toMonthly(s.amount, s.billingCycle), 0);
}
