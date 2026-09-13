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
 * Best-effort client address. Hosting platforms and reverse proxies overwrite
 * these headers; on a bare `next start` they come from the client and can be
 * forged, which is why callers pair a per-address limit with a global one.
 */
export function clientIp(request: Request): string {
  return (
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}
