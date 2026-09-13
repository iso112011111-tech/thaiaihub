/**
 * Image sources the site is willing to render.
 *
 * Stored image fields come from user-written documents. next/image throws on a
 * host that next.config does not allow, so a single unexpected URL could break
 * a whole page, or plant a tracking pixel for every visitor. Anything not on
 * this list renders as the fallback instead.
 *
 * Keep in step with `images.remotePatterns` in next.config.ts and with
 * firestore.rules.
 */
const DATA_IMAGE = /^data:image\/(webp|png|jpeg);base64,/;
const REMOTE_PREFIXES = ["https://lh3.googleusercontent.com/"];

export function safeImageSrc(src: string | null | undefined): string | undefined {
  if (!src) return undefined;
  if (src.startsWith("/") && !src.startsWith("//")) return src;
  if (DATA_IMAGE.test(src)) return src;
  if (REMOTE_PREFIXES.some((prefix) => src.startsWith(prefix))) return src;
  return undefined;
}
