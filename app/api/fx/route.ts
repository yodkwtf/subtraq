import { FALLBACK_RATES_USD } from "@/lib/fx";

export const runtime = "nodejs";
// Cache the upstream response for 12h so we don't hammer the free endpoint.
export const revalidate = 43200;

const SOURCE = "https://open.er-api.com/v6/latest/USD";

export async function GET() {
  try {
    const res = await fetch(SOURCE, { next: { revalidate } });
    if (!res.ok) throw new Error(`Upstream ${res.status}`);
    const data = await res.json();
    const rates = data?.rates;
    if (!rates || typeof rates !== "object") throw new Error("No rates in response");
    return Response.json({
      base: "USD",
      rates,
      updatedAt: new Date().toISOString(),
      live: true,
    });
  } catch {
    return Response.json({
      base: "USD",
      rates: FALLBACK_RATES_USD,
      updatedAt: null,
      live: false,
    });
  }
}
