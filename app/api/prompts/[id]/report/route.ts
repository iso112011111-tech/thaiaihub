import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { requireUser } from "@/lib/firebase/api-helpers";
import { REPORT_REASONS } from "@/lib/moderation";
import { createRateLimiter } from "@/lib/rate-limit";

class PromptNotFound extends Error {}

const NOTE_MAX = 300;
// Keyed by account, since reporting requires signing in.
const perUser = createRateLimiter({ limit: 10, windowMs: 10 * 60_000 });

/**
 * Flags a prompt for the admins. One report per reader per prompt; the prompt's
 * reportCount orders the admin queue. Admin SDK only — firestore.rules keeps
 * browsers away from both the reports and the counter.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const db = adminDb();
  if (!db) return NextResponse.json({ error: "เซิร์ฟเวอร์ยังไม่พร้อม" }, { status: 500 });

  const { uid, error } = await requireUser(request);
  if (error) return error;

  if (perUser(uid!)) {
    return NextResponse.json({ error: "รายงานถี่เกินไป กรุณารอสักครู่" }, { status: 429 });
  }

  let reason = "";
  let note = "";
  try {
    const body = await request.json();
    reason = String(body?.reason ?? "");
    note = String(body?.note ?? "").trim().slice(0, NOTE_MAX);
  } catch {
    return NextResponse.json({ error: "รูปแบบคำขอไม่ถูกต้อง" }, { status: 400 });
  }
  if (!REPORT_REASONS.some((option) => option.id === reason)) {
    return NextResponse.json({ error: "กรุณาเลือกเหตุผล" }, { status: 400 });
  }

  const { id } = await params;

  try {
    const promptRef = db.collection(COLLECTIONS.prompts).doc(id);
    const reportRef = db.collection(COLLECTIONS.reports).doc(`${id}_${uid}`);

    const alreadyReported = await db.runTransaction(async (tx) => {
      const [promptSnap, reportSnap] = await Promise.all([tx.get(promptRef), tx.get(reportRef)]);
      if (!promptSnap.exists) throw new PromptNotFound();
      if (reportSnap.exists) return true;

      tx.set(reportRef, {
        promptId: id,
        uid,
        reason,
        note,
        createdAt: FieldValue.serverTimestamp(),
      });
      tx.update(promptRef, {
        reportCount: FieldValue.increment(1),
        lastReportedAt: FieldValue.serverTimestamp(),
      });
      return false;
    });

    return NextResponse.json({ ok: true, alreadyReported });
  } catch (err) {
    if (err instanceof PromptNotFound) {
      return NextResponse.json({ error: "ไม่พบ prompt นี้" }, { status: 404 });
    }
    console.error("[report] บันทึกรายงานไม่สำเร็จ", err);
    return NextResponse.json({ error: "ส่งรายงานไม่สำเร็จ กรุณาลองใหม่" }, { status: 500 });
  }
}
