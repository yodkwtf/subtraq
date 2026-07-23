"use client";

import { useCallback } from "react";
import { useStore } from "@/lib/store";
import { convert, FALLBACK_RATES_USD } from "@/lib/fx";
import { formatCurrency } from "@/lib/utils";

/**
 * Converts any subscription amount into the user's default (display) currency
 * using live FX rates, then formats it. Every on-screen amount runs through
 * this so the whole UI reads in one currency, regardless of the currency a
 * subscription was originally added in. (The Add/Edit form is the exception:
 * it edits the raw stored amount in its own currency.)
 */
export function useDisplayCurrency() {
  const displayCurrency = useStore((s) => s.settings.currency);
  const fxRates = useStore((s) => s.fxRates);
  const rates = fxRates ?? FALLBACK_RATES_USD;

  const toDisplay = useCallback(
    (amount: number, from: string) => convert(amount, from, displayCurrency, rates),
    [displayCurrency, rates]
  );

  const formatDisplay = useCallback(
    (amount: number, from: string, opts?: { compact?: boolean }) =>
      formatCurrency(convert(amount, from, displayCurrency, rates), displayCurrency, opts),
    [displayCurrency, rates]
  );

  return { displayCurrency, toDisplay, formatDisplay };
}
