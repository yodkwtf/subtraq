import { generateText, isAiConfigured, parseJsonLoose } from "@/lib/ai";

export const runtime = "nodejs";

interface IncomingSub {
  id: string;
  name: string;
  category: string;
  amount: number;
  billingCycle: string;
  status: string;
}

export async function POST(req: Request) {
  if (!isAiConfigured()) {
    return Response.json(
      { error: "GEMINI_API_KEY is not configured on the server." },
      { status: 500 }
    );
  }

  let subscriptions: IncomingSub[] = [];
  try {
    const body = await req.json();
    subscriptions = Array.isArray(body.subscriptions) ? body.subscriptions : [];
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (subscriptions.length === 0) {
    return Response.json({ suggestions: [] });
  }

  try {
    const text = await generateText({
      system:
        "You are a personal finance assistant that helps people trim wasteful subscriptions. " +
        "Be conservative: only suggest cancelling when there is a clear reason such as high cost, " +
        "redundant/overlapping services in the same category, or low likely usage. " +
        "Estimate potentialSaving as the ANNUAL cost saved. Respond with valid JSON only.",
      prompt: `Given these subscriptions: ${JSON.stringify(subscriptions)}, suggest which ones to cancel based on: high cost, low usage likelihood (inferred from category + overlapping services). Return ONLY valid JSON in this exact shape: { "suggestions": [{ "id": "", "name": "", "reason": "", "potentialSaving": 0 }] }`,
      maxOutputTokens: 4096,
      temperature: 0.3,
      json: true,
    });

    const parsed = parseJsonLoose<{ suggestions?: unknown[] }>(text);

    const suggestions = Array.isArray(parsed?.suggestions)
      ? parsed.suggestions
          .filter((s: unknown): s is Record<string, unknown> => typeof s === "object" && s !== null)
          .map((s: Record<string, unknown>) => ({
            id: String(s.id ?? ""),
            name: String(s.name ?? ""),
            reason: String(s.reason ?? ""),
            potentialSaving: Number(s.potentialSaving ?? 0) || 0,
          }))
      : [];

    return Response.json({ suggestions });
  } catch (err) {
    const messageText =
      err instanceof Error ? err.message : "Failed to generate suggestions.";
    return Response.json({ error: messageText }, { status: 502 });
  }
}
