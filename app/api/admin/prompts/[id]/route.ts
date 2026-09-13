import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { invalidatePromptsCache } from "@/data/prompts";
import { adminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { requireAdmin } from "@/lib/firebase/api-helpers";
import { deletePromptCascade } from "@/lib/firebase/prompt-admin";

/**
 * Moderation actions on one prompt:
 * - `hide`    takes it off every public list, search, its page and the AI bot
 * - `publish` puts a hidden prompt back
 * - `dismiss` clears its reports without hiding it
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { uid, error } = await requireAdmin(request);
  if (error) return error;

  const db = adminDb();
  if (!db) return NextResponse.json({ error: "เซิร์ฟเวอร์ยังไม่พร้อม" }, { status: 500 });

  let action = "";
  try {
    action = String((await request.json())?.action ?? "");
  } catch {
    return NextResponse.json({ error: "รูปแบบคำขอไม่ถูกต้อง" }, { status: 400 });
  }

  const audit = { moderatedAt: FieldValue.serverTimestamp(), moderatedBy: uid };
  const updates: Record<string, Record<string, unknown>> = {
    hide: { status: "hidden", ...audit },
    publish: { status: "published", ...audit },
    dismiss: { reportCount: 0, ...audit },
  };
  const update = updates[action];
  if (!update) return NextResponse.json({ error: "คำสั่งไม่ถูกต้อง" }, { status: 400 });

  const { id } = await params;
  try {
    const ref = db.collection(COLLECTIONS.prompts).doc(id);
    if (!(await ref.get()).exists) {
      return NextResponse.json({ error: "ไม่พบ prompt นี้" }, { status: 404 });
    }
    await ref.update(update);
    invalidatePromptsCache();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin] อัปเดต prompt ไม่สำเร็จ", err);
    return NextResponse.json({ error: "ทำรายการไม่สำเร็จ" }, { status: 500 });
  }
}

/** Permanently delete a prompt as an admin, with the same cleanup as an owner delete. */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const db = adminDb();
  if (!db) return NextResponse.json({ error: "เซิร์ฟเวอร์ยังไม่พร้อม" }, { status: 500 });

  const { id } = await params;
  try {
    const ref = db.collection(COLLECTIONS.prompts).doc(id);
    if (!(await ref.get()).exists) {
      return NextResponse.json({ error: "ไม่พบ prompt นี้" }, { status: 404 });
    }
    await deletePromptCascade(db, ref, id);
    invalidatePromptsCache();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin] ลบ prompt ไม่สำเร็จ", err);
    return NextResponse.json({ error: "ลบไม่สำเร็จ" }, { status: 500 });
  }
}
