import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/**
 * Signs the bot's replies so a client cannot invent them.
 *
 * The chat widget sends earlier messages back as conversation history. Without
 * a signature anyone could put words in the bot's mouth ("as I said, visit …")
 * and steer the next answer. Every reply carries an HMAC; history entries that
 * claim to be the bot without a valid one are dropped.
 *
 * The key is CHAT_SIGNING_SECRET, or derived from AI_API_KEY so that every server
 * instance agrees without extra setup. HMAC is one-way: a signature reveals
 * nothing about the key it was made with.
 */
function signingKey(): Buffer {
  const secret = process.env.CHAT_SIGNING_SECRET || process.env.AI_API_KEY || "";
  return createHash("sha256").update(`thai-ai-hub:chat-history:${secret}`).digest();
}

export function signReply(text: string): string {
  return createHmac("sha256", signingKey()).update(text).digest("base64url");
}

export function isSignedReply(text: string, signature: unknown): boolean {
  if (typeof signature !== "string") return false;
  const expected = Buffer.from(signReply(text));
  const given = Buffer.from(signature);
  return expected.length === given.length && timingSafeEqual(expected, given);
}
