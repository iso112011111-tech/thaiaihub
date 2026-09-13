import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { requireAdmin } from "@/lib/firebase/api-helpers";

export interface AdminPromptItem {
  id: string;
  slug: string;
  title: string;
  authorName: string;
  status: "published" | "hidden";
  reportCount: number;
  createdAt: string;
  reports: { reason: string; note: string }[];
}

const LIMIT = 50;
const REPORTS_PER_PROMPT = 10;

/**
 * The admin moderation queue: `view=reported` (default, most reported first),
 * `view=hidden`, or `view=recent`. Each query uses a single field, so none of
 * them needs a composite index in Firestore.
 */
export async function GET(request: Request) {
  const { error } = await requireAdmin(request);
  if (error) return error;

  const db = adminDb();
  if (!db) return NextResponse.json({ error: "เซิร์ฟเวอร์ยังไม่พร้อม" }, { status: 500 });

  const view = new URL(request.url).searchParams.get("view") ?? "reported";
  const prompts = db.collection(COLLECTIONS.prompts);
  const query =
    view === "hidden"
      ? prompts.where("status", "==", "hidden").limit(LIMIT)
      : view === "recent"
        ? prompts.orderBy("createdAt", "desc").limit(LIMIT)
        : prompts.where("reportCount", ">", 0).orderBy("reportCount", "desc").limit(LIMIT);

  try {
    const snapshot = await query.get();
    const items = await Promise.all(
      snapshot.docs.map(async (doc): Promise<AdminPromptItem> => {
        const data = doc.data();
        const reportCount: number = data.reportCount ?? 0;
        const reports =
          reportCount > 0
            ? (
                await db
                  .collection(COLLECTIONS.reports)
                  .where("promptId", "==", doc.id)
                  .limit(REPORTS_PER_PROMPT)
                  .get()
              ).docs.map((report) => ({
                reason: String(report.data().reason ?? ""),
                note: String(report.data().note ?? ""),
              }))
            : [];

        return {
          id: doc.id,
          slug: data.slug ?? doc.id,
          title: data.title ?? "",
          authorName: data.author?.name ?? "ไม่ระบุชื่อ",
          status: data.status === "hidden" ? "hidden" : "published",
          reportCount,
          createdAt:
            typeof data.createdAt?.toDate === "function" ? data.createdAt.toDate().toISOString() : "",
          reports,
        };
      }),
    );
    return NextResponse.json({ items }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[admin] โหลดรายการ prompt ไม่สำเร็จ", err);
    return NextResponse.json({ error: "โหลดรายการไม่สำเร็จ" }, { status: 500 });
  }
}
