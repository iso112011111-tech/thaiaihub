import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";

/**
 * Counts one read of a prompt. Runs through the Admin SDK so the `views` field
 * stays closed to direct client writes — otherwise anyone could set it freely.
 *
 * The browser already skips repeat views for 24h, but anyone can call this
 * endpoint directly, and views rank the popular and trending lists. So the
 * server also counts an address at most once per prompt per six hours, and caps
 * how many prompts one address can bump per minute. See lib/rate-limit for the
 * limits of in-memory counting; this is honest analytics, not fraud-proof.
 */
const perPrompt = createRateLimiter({ limit: 1, windowMs: 6 * 60 * 60 * 1000 });
const perAddress = createRateLimiter({ limit: 30, windowMs: 60_000 });
const withoutCookieBurst = createRateLimiter({ limit: 10, windowMs: 60_000 });

function getViewerId(request: Request): { viewerId: string; isNew: boolean } {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(/(?:^|;\s*)view_token=([^;]+)/);
  if (match && match[1]) {
    return { viewerId: match[1], isNew: false };
  }
  return { viewerId: crypto.randomUUID(), isNew: true };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const db = adminDb();
  if (!db) return NextResponse.json({ ok: false }, { status: 500 });

  const { id } = await params;
  const ip = clientIp(request);
  const { viewerId, isNew } = getViewerId(request);

  // Checks address burst limit, cookie-less burst limit, and persistent cookie viewer limit
  if (perAddress(ip) || (isNew && withoutCookieBurst(ip)) || perPrompt(`${viewerId}:${id}`)) {
    const response = NextResponse.json({ ok: true, counted: false });
    if (isNew) {
      response.cookies.set("view_token", viewerId, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });
    }
    return response;
  }

  try {
    await db
      .collection(COLLECTIONS.prompts)
      .doc(id)
      .update({ views: FieldValue.increment(1) });

    const response = NextResponse.json({ ok: true, counted: true });
    if (isNew) {
      response.cookies.set("view_token", viewerId, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });
    }
    return response;
  } catch {
    // A missing document (seed fallback data) should not surface as an error.
    return NextResponse.json({ ok: false });
  }
}
