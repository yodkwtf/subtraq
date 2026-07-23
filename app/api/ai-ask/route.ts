import { generateText, isAiConfigured } from "@/lib/ai";

export const runtime = "nodejs";

interface IncomingSub {
  name: string;
  category: string;
  amount: number;
  currency: string;
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

  let question = "";
  let subscriptions: IncomingSub[] = [];
  try {
    const body = await req.json();
    question = typeof body.question === "string" ? body.question.trim() : "";
    subscriptions = Array.isArray(body.subscriptions) ? body.subscriptions : [];
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!question) return Response.json({ error: "Ask a question first." }, { status: 400 });

  try {
    const answer = await generateText({
      system:
        "You are SubTraq, a concise personal-finance assistant for a subscription tracker. " +
        "Answer only from the provided subscription data. Be specific and practical, use the " +
        "currencies as given, and keep answers under 120 words. Plain text, no markdown headings.",
      prompt: `My subscriptions: ${JSON.stringify(subscriptions)}\n\nQuestion: ${question}`,
      maxOutputTokens: 1536,
    });
    return Response.json({ answer });
  } catch (err) {
    const messageText = err instanceof Error ? err.message : "Failed to answer.";
    return Response.json({ error: messageText }, { status: 502 });
  }
}
