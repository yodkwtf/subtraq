/**
 * Server-side helper for the Google Gemini API (free tier via Google AI Studio).
 * Uses the REST endpoint directly so there's no SDK dependency to keep in sync.
 * The key is read on the server only and never exposed to the browser.
 *
 * Get a free key at https://aistudio.google.com/apikey. Override the model with
 * GEMINI_MODEL if the default isn't available on your account.
 *
 * Default is the rolling `gemini-flash-latest` alias so it tracks whatever the current
 * free-tier Flash model is (Google retires specific versions - e.g. gemini-2.0-flash was
 * shut down in mid-2026, which surfaces as a "limit: 0 / quota exceeded" error).
 */

export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";

/** True when a Gemini API key is present on the server. */
export function isAiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

interface GenerateOptions {
  system: string;
  prompt: string;
  maxOutputTokens?: number;
  temperature?: number;
  /** Ask Gemini to return strict JSON (sets responseMimeType). */
  json?: boolean;
}

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";

/** Generate text with Gemini. Throws with a readable message on failure. */
export async function generateText({
  system,
  prompt,
  maxOutputTokens = 512,
  temperature = 0.7,
  json = false,
}: GenerateOptions): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not configured on the server.");

  const res = await fetch(`${ENDPOINT}/${GEMINI_MODEL}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        // Thinking models spend part of this budget on reasoning, so keep it
        // generous or the answer gets truncated ("Unterminated string" when
        // parsing the cut-off JSON). We deliberately don't send `thinkingConfig`:
        // its shape differs across model versions (thinkingBudget vs thinkingLevel)
        // and an unknown field returns "invalid argument".
        maxOutputTokens,
        temperature,
        ...(json ? { responseMimeType: "application/json" } : {}),
      },
    }),
  });

  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = body?.error?.message ?? "";
    } catch {
      // Non-JSON error body; fall back to the status code.
    }
    throw new Error(detail || `Gemini request failed (${res.status}).`);
  }

  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts;
  // Newer "thinking" models can include reasoning parts (thought: true) alongside
  // the answer - keep only the answer text.
  const text = Array.isArray(parts)
    ? parts
        .filter((p: { thought?: boolean }) => !p?.thought)
        .map((p: { text?: string }) => p?.text ?? "")
        .join("")
    : "";
  return String(text).trim();
}

/**
 * Parse JSON from an LLM reply, tolerating the usual quirks: markdown code
 * fences, stray prose around the JSON, and trailing commas.
 */
export function parseJsonLoose<T = unknown>(text: string): T {
  let s = text.trim();

  const fenced = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) s = fenced[1].trim();

  // Narrow to the outermost JSON object or array.
  const first = [s.indexOf("{"), s.indexOf("[")].filter((i) => i !== -1);
  const start = first.length ? Math.min(...first) : -1;
  const end = Math.max(s.lastIndexOf("}"), s.lastIndexOf("]"));
  if (start !== -1 && end > start) s = s.slice(start, end + 1);

  try {
    return JSON.parse(s) as T;
  } catch {
    // Retry after removing trailing commas (a common model quirk).
    return JSON.parse(s.replace(/,(\s*[}\]])/g, "$1")) as T;
  }
}
