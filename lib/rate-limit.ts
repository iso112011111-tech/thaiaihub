import "server-only";

/**
 * In-memory fixed-window rate limiting for public endpoints.
 *
 * State lives in this server process, so each instance of a multi-instance
 * deployment counts on its own. That blunts casual abuse and caps spend per
 * instance; put a platform limiter (Vercel Firewall, Cloudflare) in front for
 * anything stronger.
 */

interface Window {
  count: number;
  resetAt: number;
}

/** Forged or rotating keys must not be able to grow memory without bound. */
const MAX_TRACKED_KEYS = 10_000;

/** Returns `isLimited(key)`: true once `key` has been seen more than `limit` times this window. */
export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const windows = new Map<string, Window>();

  return function isLimited(key: string): boolean {
    const now = Date.now();

    if (windows.size >= MAX_TRACKED_KEYS) {
      for (const [tracked, window] of windows) {
        if (window.resetAt <= now) windows.delete(tracked);
      }
      if (windows.size >= MAX_TRACKED_KEYS) windows.clear();
    }

    const current = windows.get(key);
    if (!current || current.resetAt <= now) {
      windows.set(key, { count: 1, resetAt: now + windowMs });
      return false;
    }
    current.count += 1;
    return current.count > limit;
  };
}

/**
 * The client address, only when it can be trusted.
 *
 * `x-real-ip` and `x-forwarded-for` are only as honest as whatever sits in
 * front of the app. Vercel sets them itself and discards values sent by the
 * client; a bare `next start` passes the client's own headers through, so anyone
 * could claim a new address on every request and walk past per-address limits.
 * Off Vercel the headers are ignored unless TRUST_PROXY_HEADERS=1 declares a
 * reverse proxy that overwrites them, and every caller shares one bucket — the
 * limit then fails closed instead of open.
 */
export function clientIp(request: Request): string {
  const trusted = Boolean(process.env.VERCEL) || process.env.TRUST_PROXY_HEADERS === "1";
  if (!trusted) return "untrusted-proxy";
  return (
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}
