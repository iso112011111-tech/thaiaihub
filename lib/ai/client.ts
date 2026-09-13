import "server-only";

/**
 * AI THAI BOT's model client: an OpenAI-compatible chat-completions endpoint
 * (the maxplus-ai relay in front of Gemini), called over REST so there is no
 * SDK dependency. The key only ever lives on the server.
 *
 * The relay ignores structured-output settings (`response_format`, Gemini's
 * `responseSchema`), so callers must ask for JSON in the prompt itself and read
 * the reply leniently with `parseJsonReply`.
 */

/** The only model the bot is allowed to use. */
export const AI_MODEL = "gemini-2.5-flash";

const TIMEOUT_MS = 30_000;

export interface ChatTurn {
  role: "user" | "assistant";
  text: string;
}

export function aiConfigured(): boolean {
  return Boolean(process.env.AI_BASE_URL && process.env.AI_API_KEY);
}

/**
 * Sends one conversation and returns the model's text reply. Throws on any
 * transport error or empty reply, so the caller can fall back.
 */
export async function generateText({
  system,
  turns,
}: {
  system: string;
  turns: ChatTurn[];
}): Promise<string> {
  const base = process.env.AI_BASE_URL;
  const key = process.env.AI_API_KEY;
  if (!base || !key) throw new Error("AI_BASE_URL / AI_API_KEY are not set");

  const response = await fetch(`${base.replace(/\/+$/, "")}/v1/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [
        { role: "system", content: system },
        ...turns.map((turn) => ({ role: turn.role, content: turn.text })),
      ],
      temperature: 0.4,
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = data?.error?.message ?? data?.message ?? "unknown error";
    throw new Error(`AI ${response.status}: ${detail}`);
  }

  const text: unknown = data?.choices?.[0]?.message?.content;
  if (typeof text !== "string" || !text.trim()) {
    throw new Error(`AI returned no text (finish: ${data?.choices?.[0]?.finish_reason ?? "none"})`);
  }
  return text;
}

/**
 * Pulls a JSON object out of a model reply that may wrap it in ```json fences
 * or surround it with prose. Returns null when there is nothing parsable.
 */
export function parseJsonReply(text: string): Record<string, unknown> | null {
  const unfenced = text.replace(/```(?:json)?/gi, "");
  const start = unfenced.indexOf("{");
  const end = unfenced.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    const value: unknown = JSON.parse(unfenced.slice(start, end + 1));
    return value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}
