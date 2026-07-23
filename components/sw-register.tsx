"use client";

import * as React from "react";

/**
 * Registers the offline service worker in production only (dev caching makes
 * iteration confusing). Renders nothing.
 */
export function ServiceWorkerRegister() {
  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Registration failures are non-fatal; the app still works online.
    });
  }, []);

  return null;
}
