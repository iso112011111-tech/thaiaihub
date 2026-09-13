import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { requireUser, requireVerifiedUser } from "@/lib/firebase/api-helpers";

class PromptNotFound extends Error {}

/**
 * Stores one rating per user and recomputes the prompt's average.
 *
 * The whole thing runs in a transaction: the per-user rating document and the
 * aggregate on the prompt must move together, or a burst of concurrent votes
 * would leave the average wrong.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const db = adminDb();
  if (!db) return NextResponse.json({ error: "เซิร์ฟเวอร์ยังไม่พร้อม" }, { status: 500 });

  // A verified email keeps throwaway accounts from moving the numbers.
  const { uid, error } = await requireVerifiedUser(request);
  if (error) return error;

  let score = Number.NaN;
  try {
    const body = await request.json();
    score = Number(body?.value);
  } catch {
    return NextResponse.json({ error: "รูปแบบคำขอไม่ถูกต้อง" }, { status: 400 });
  }
  if (!Number.isInteger(score) || score < 1 || score > 5) {
    return NextResponse.json({ error: "คะแนนต้องเป็น 1 ถึง 5" }, { status: 400 });
  }

  const { id } = await params;

  try {
    const promptRef = db.collection(COLLECTIONS.prompts).doc(id);
    const ratingRef = promptRef.collection("ratings").doc(uid!);

    const result = await db.runTransaction(async (tx) => {
      const [promptSnap, ratingSnap] = await Promise.all([
        tx.get(promptRef),
        tx.get(ratingRef),
      ]);
      if (!promptSnap.exists) throw new PromptNotFound();

      const data = promptSnap.data() ?? {};
      const count: number = data.ratingCount ?? 0;
      const average: number = data.rating ?? 0;
      let total = average * count;

      let nextCount = count;
      if (ratingSnap.exists) {
        // Changing an existing vote swaps the old score out of the total.
        total = total - (ratingSnap.data()?.value ?? 0) + score;
      } else {
        total += score;
        nextCount = count + 1;
      }

      const nextAverage = nextCount > 0 ? total / nextCount : 0;
      tx.set(ratingRef, { uid, value: score, updatedAt: new Date() });
      tx.update(promptRef, {
        rating: Math.round(nextAverage * 10) / 10,
        ratingCount: nextCount,
      });

      return { rating: Math.round(nextAverage * 10) / 10, ratingCount: nextCount };
    });

    return NextResponse.json({ ok: true, ...result, yourRating: score });
  } catch (err) {
    if (err instanceof PromptNotFound) {
      return NextResponse.json({ error: "ไม่พบ prompt นี้" }, { status: 404 });
    }
    // Internal details stay in the server log.
    console.error("[rate] ให้คะแนนไม่สำเร็จ", err);
    return NextResponse.json({ error: "ให้คะแนนไม่สำเร็จ กรุณาลองใหม่" }, { status: 500 });
  }
}

/** Returns the signed-in user's own rating so the stars render pre-filled. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const db = adminDb();
  if (!db) return NextResponse.json({ yourRating: 0 });

  const { uid, error } = await requireUser(request);
  if (error) return NextResponse.json({ yourRating: 0 });

  const { id } = await params;
  try {
    const snap = await db
      .collection(COLLECTIONS.prompts)
      .doc(id)
      .collection("ratings")
      .doc(uid!)
      .get();
    return NextResponse.json({ yourRating: snap.exists ? (snap.data()?.value ?? 0) : 0 });
  } catch {
    return NextResponse.json({ yourRating: 0 });
  }
}
