import { generateText, isAiConfigured, parseJsonLoose } from "@/lib/ai";
import { CATEGORIES, BILLING_CYCLES } from "@/lib/constants";
import type { Category, BillingCycle } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!isAiConfigured()) {
    return Response.json(
      { error: "GEMINI_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  let name = "";
  try {
    const body = await req.json();
    name = typeof body.name === "string" ? body.name.trim() : "";
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!name) return Response.json({ error: "A name is required." }, { status: 400 });

  try {
    const text = await generateText({
      system:
        "You classify subscription/service names for a subscription tracker. " +
        "Pick the single best category and the most common billing cycle for that service. " +
        "Respond with valid JSON only, no prose.",
      prompt:
        `Service name: "${name}".\n` +
        `Choose category from: ${CATEGORIES.join(", ")}.\n` +
        `Choose billingCycle from: ${BILLING_CYCLES.join(", ")}.\n` +
        `Return ONLY JSON: { "category": "", "billingCycle": "" }`,
      maxOutputTokens: 1536,
      temperature: 0.2,
      json: true,
    });

    const parsed = parseJsonLoose<{ category?: unknown; billingCycle?: unknown }>(text);

    const category = CATEGORIES.includes(parsed.category as Category)
      ? (parsed.category as Category)
      : "Other";
    const billingCycle = BILLING_CYCLES.includes(parsed.billingCycle as BillingCycle)
      ? (parsed.billingCycle as BillingCycle)
      : "Monthly";

    return Response.json({ category, billingCycle });
  } catch (err) {
    const messageText =
      err instanceof Error ? err.message : "Failed to classify the subscription.";
    return Response.json({ error: messageText }, { status: 502 });
  }
}
