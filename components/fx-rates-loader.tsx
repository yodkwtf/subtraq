"use client";

import * as React from "react";
import { useStore } from "@/lib/store";

const TWELVE_HOURS = 12 * 60 * 60 * 1000;

/**
 * Refreshes FX rates (used to normalise multi-currency totals) in the
 * background, at most once every 12 hours. Renders nothing.
 */
export function FxRatesLoader() {
  const fxUpdatedAt = useStore((s) => s.fxUpdatedAt);
  const setFxRates = useStore((s) => s.setFxRates);

  React.useEffect(() => {
    const fresh =
      fxUpdatedAt && Date.now() - new Date(fxUpdatedAt).getTime() < TWELVE_HOURS;
    if (fresh) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/fx");
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || !data?.rates) return;
        setFxRates(data.rates, data.updatedAt ?? new Date().toISOString());
      } catch {
        // Keep the static fallback rates already baked into the store.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fxUpdatedAt, setFxRates]);

  return null;
}
