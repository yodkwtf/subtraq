import type { CurrencyCode } from "./types";

/**
 * Approximate fallback rates expressed as "1 USD = X units of currency".
 * Used when live rates haven't loaded (or the network is unavailable) so totals
 * never break. Live rates from /api/fx override these at runtime.
 */
export const FALLBACK_RATES_USD: Record<CurrencyCode, number> = {
  USD: 1,
  INR: 83,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 157,
  AUD: 1.52,
  CAD: 1.36,
  SGD: 1.35,
  AED: 3.67,
  CNY: 7.1,
  CHF: 0.89,
  BRL: 5.4,
  ZAR: 18.5,
  NZD: 1.64,
};

export type FxRates = Record<string, number>;

/** Convert an amount between currencies using USD-based rates. */
export function convert(
  amount: number,
  from: string,
  to: string,
  rates: FxRates = FALLBACK_RATES_USD
): number {
  if (from === to) return amount;
  const rf = rates[from] ?? FALLBACK_RATES_USD[from as CurrencyCode];
  const rt = rates[to] ?? FALLBACK_RATES_USD[to as CurrencyCode];
  if (!rf || !rt) return amount;
  return (amount / rf) * rt;
}
