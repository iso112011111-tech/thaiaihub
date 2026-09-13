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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const db = adminDb();
  if (!db) return NextResponse.json({ ok: false }, { status: 500 });

  const { id } = await params;
  const ip = clientIp(request);
  if (perAddress(ip) || perPrompt(`${ip}:${id}`)) {
    // Not an error for a reader who came back; the view just is not counted again.
    return NextResponse.json({ ok: true, counted: false });
  }

  try {
    await db
      .collection(COLLECTIONS.prompts)
      .doc(id)
      .update({ views: FieldValue.increment(1) });
    return NextResponse.json({ ok: true, counted: true });
  } catch {
    // A missing document (seed fallback data) should not surface as an error.
    return NextResponse.json({ ok: false });
  }
}
