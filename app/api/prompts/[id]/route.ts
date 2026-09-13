import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { invalidatePromptsCache } from "@/data/prompts";
import { adminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { requireUser } from "@/lib/firebase/api-helpers";
import { deletePromptCascade } from "@/lib/firebase/prompt-admin";
import { categories } from "@/lib/constants";
import { isImageDataUri, normalizeTags, PROMPT_LIMITS } from "@/lib/prompt-limits";

const badRequest = (message: string) => NextResponse.json({ error: message }, { status: 400 });

async function loadOwned(id: string, uid: string) {
  const db = adminDb();
  if (!db) return { error: NextResponse.json({ error: "เซิร์ฟเวอร์ยังไม่พร้อม" }, { status: 500 }) };

  const ref = db.collection(COLLECTIONS.prompts).doc(id);
  const snapshot = await ref.get();
  if (!snapshot.exists) {
    return { error: NextResponse.json({ error: "ไม่พบ prompt นี้" }, { status: 404 }) };
  }
  if (snapshot.data()?.author?.id !== uid) {
    return { error: NextResponse.json({ error: "ทำได้เฉพาะเจ้าของ prompt เท่านั้น" }, { status: 403 }) };
  }
  return { db, ref, data: snapshot.data() ?? {} };
}

type EditResult =
  | { update: Record<string, unknown>; gallery?: string[] }
  | { error: string };

/**
 * Turns an edit request into a Firestore update, or explains what is wrong.
 *
 * The Admin SDK bypasses firestore.rules, so this is the only check edits get.
 * Every field is optional, but whatever is present must be well formed; counters,
 * author and slug are never taken from the request.
 */
function buildUpdate(body: Record<string, unknown>): EditResult {
  const update: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };

  if (body.title !== undefined) {
    const title = String(body.title).trim();
    if (!title || title.length > PROMPT_LIMITS.title) {
      return { error: `ชื่อ prompt ต้องยาว 1-${PROMPT_LIMITS.title} ตัวอักษร` };
    }
    update.title = title;
  }

  if (body.excerpt !== undefined) {
    const excerpt = String(body.excerpt).trim();
    if (excerpt.length > PROMPT_LIMITS.excerpt) {
      return { error: `คำอธิบายสั้นต้องไม่เกิน ${PROMPT_LIMITS.excerpt} ตัวอักษร` };
    }
    update.excerpt = excerpt;
  }

  if (body.body !== undefined) {
    const text = String(body.body).trim();
    if (!text || text.length > PROMPT_LIMITS.body) {
      return { error: `เนื้อหา prompt ต้องยาวไม่เกิน ${PROMPT_LIMITS.body.toLocaleString()} ตัวอักษร` };
    }
    update.body = text;
  }

  if (body.category !== undefined) {
    const category = String(body.category);
    if (category === "all" || !categories.some((c) => c.id === category)) {
      return { error: "หมวดหมู่ไม่ถูกต้อง" };
    }
    update.category = category;
  }

  if (body.tags !== undefined) update.tags = normalizeTags(body.tags);

  if (body.images === undefined) return { update };

  // `images` is all-or-nothing: sending it replaces the cover and the gallery.
  // Only data URIs from our own uploader are accepted — an arbitrary URL here
  // would be fetched by every visitor's browser.
  if (!Array.isArray(body.images) || body.images.length > PROMPT_LIMITS.images) {
    return { error: `แนบภาพได้สูงสุด ${PROMPT_LIMITS.images} ภาพ` };
  }
  const [cover, ...rest] = body.images as unknown[];
  if (cover !== undefined && !isImageDataUri(cover, PROMPT_LIMITS.coverBytes)) {
    return { error: "ภาพปกไม่ถูกต้องหรือใหญ่เกินไป" };
  }
  if (!rest.every((image) => isImageDataUri(image, PROMPT_LIMITS.galleryBytes))) {
    return { error: "ภาพประกอบไม่ถูกต้องหรือใหญ่เกินไป" };
  }
  update.coverUrl = cover ?? null;
  update.imageCount = body.images.length;
  return { update, gallery: rest as string[] };
}

/** Edit a prompt. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { uid, error } = await requireUser(request);
  if (error) return error;

  const { id } = await params;
  const owned = await loadOwned(id, uid!);
  if (owned.error) return owned.error;
  const { ref } = owned;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("รูปแบบคำขอไม่ถูกต้อง");
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return badRequest("รูปแบบคำขอไม่ถูกต้อง");
  }

  const result = buildUpdate(body as Record<string, unknown>);
  if ("error" in result) return badRequest(result.error);
  const { update, gallery } = result;

  if (gallery) {
    const existing = await ref.collection("images").get();
    const batch = ref.firestore.batch();
    existing.docs.forEach((doc) => batch.delete(doc.ref));
    gallery.forEach((dataUri, index) => {
      batch.set(ref.collection("images").doc(String(index)), {
        authorId: uid,
        order: index,
        dataUri,
      });
    });
    batch.update(ref, update);
    await batch.commit();
  } else {
    await ref.update(update);
  }

  invalidatePromptsCache();
  return NextResponse.json({ ok: true });
}

/** Delete a prompt together with everything filed under it. */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { uid, error } = await requireUser(request);
  if (error) return error;

  const { id } = await params;
  const owned = await loadOwned(id, uid!);
  if (owned.error) return owned.error;
  const { db, ref } = owned;

  await deletePromptCascade(db, ref, id);
  invalidatePromptsCache();

  return NextResponse.json({ ok: true });
}
