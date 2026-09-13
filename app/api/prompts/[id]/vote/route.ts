import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { requireUser } from "@/lib/firebase/api-helpers";

class PromptNotFound extends Error {}

/**
 * Toggles the caller's upvote. One vote document per user per prompt.
 *
 * Vote documents are writable only here — firestore.rules denies clients. If a
 * browser could create one directly, this toggle would then remove a vote that
 * never added to the count, and repeating that would drive any score down.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const db = adminDb();
  if (!db) return NextResponse.json({ error: "เซิร์ฟเวอร์ยังไม่พร้อม" }, { status: 500 });

  const { uid, error } = await requireUser(request);
  if (error) return error;

  const { id } = await params;

  try {
    const promptRef = db.collection(COLLECTIONS.prompts).doc(id);
    const voteRef = db.collection(COLLECTIONS.votes).doc(`${uid}_${id}`);

    const voted = await db.runTransaction(async (tx) => {
      const [promptSnap, voteSnap] = await Promise.all([tx.get(promptRef), tx.get(voteRef)]);
      if (!promptSnap.exists) throw new PromptNotFound();

      if (voteSnap.exists) {
        tx.delete(voteRef);
        tx.update(promptRef, { upvotes: FieldValue.increment(-1) });
        return false;
      }
      tx.set(voteRef, { uid, promptId: id, createdAt: new Date() });
      tx.update(promptRef, { upvotes: FieldValue.increment(1) });
      return true;
    });

    const fresh = await promptRef.get();
    return NextResponse.json({ voted, upvotes: fresh.data()?.upvotes ?? 0 });
  } catch (err) {
    if (err instanceof PromptNotFound) {
      return NextResponse.json({ error: "ไม่พบ prompt นี้" }, { status: 404 });
    }
    // Internal details stay in the server log.
    console.error("[vote] โหวตไม่สำเร็จ", err);
    return NextResponse.json({ error: "โหวตไม่สำเร็จ กรุณาลองใหม่" }, { status: 500 });
  }
}

/** Whether the caller has already upvoted, so the button renders in the right state. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const db = adminDb();
  if (!db) return NextResponse.json({ voted: false });

  const { uid, error } = await requireUser(request);
  if (error) return NextResponse.json({ voted: false });

  const { id } = await params;
  try {
    const snap = await db.collection(COLLECTIONS.votes).doc(`${uid}_${id}`).get();
    return NextResponse.json({ voted: snap.exists });
  } catch {
    return NextResponse.json({ voted: false });
  }
}
