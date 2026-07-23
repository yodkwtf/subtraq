import { addMonths, addYears, format, isBefore, isValid, parseISO, startOfToday } from "date-fns";
import type { BillingCycle } from "./types";

/** Advance a date by one billing cycle. */
export function stepByCycle(date: Date, cycle: BillingCycle): Date {
  if (cycle === "Annually") return addYears(date, 1);
  if (cycle === "Quarterly") return addMonths(date, 3);
  return addMonths(date, 1);
}

/** Today's date as a local `yyyy-MM-dd` string (avoids the UTC off-by-one that
 * `toISOString()` causes in timezones behind/ahead of UTC). */
export function todayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

/** One billing cycle after `startDate`, as a `yyyy-MM-dd` string. */
export function renewalFromCycle(startDate: string, cycle: BillingCycle): string {
  const base = parseISO(startDate);
  return format(stepByCycle(isValid(base) ? base : new Date(), cycle), "yyyy-MM-dd");
}

/**
 * The first renewal on or after `from` (default: today), stepping by the billing
 * cycle from `start`. Keeps sample data and active subscriptions from drifting
 * into the past: a monthly sub always shows a renewal within the next month, a
 * yearly one within the next year, etc.
 */
export function nextRenewalOnOrAfter(
  start: string,
  cycle: BillingCycle,
  from: Date = startOfToday()
): string {
  let next = parseISO(start);
  if (!isValid(next)) next = from;
  // Guard against a pathological loop on bad input.
  let guard = 0;
  while (isBefore(next, from) && guard++ < 1200) next = stepByCycle(next, cycle);
  return format(next, "yyyy-MM-dd");
}
