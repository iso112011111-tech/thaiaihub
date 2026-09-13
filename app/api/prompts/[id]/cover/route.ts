import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { isImageDataUri, PROMPT_LIMITS } from "@/lib/prompt-limits";

const notFound = () => new NextResponse(null, { status: 404 });

/**
 * Serves a prompt's cover as a real image file.
 *
 * Covers are stored inline as data URIs (no paid Storage). Lists used to carry
 * them in every card, which put up to ~120 KB per prompt into the cached prompt
 * list in server memory and into the page HTML. Lists now point here with
 * `?v=<last change>` in the URL, so each cover downloads once and is then served
 * from the browser and CDN cache; an edit changes `v` and fetches the new one.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const db = adminDb();
  if (!db) return notFound();

  const { id } = await params;
  try {
    const data = (await db.collection(COLLECTIONS.prompts).doc(id).get()).data();
    const cover: unknown = data?.coverUrl;
    if (!data || data.status === "hidden" || !isImageDataUri(cover, PROMPT_LIMITS.coverBytes)) {
      return notFound();
    }

    const [, mime, base64] = cover.match(/^data:(image\/[a-z]+);base64,(.+)$/) ?? [];
    if (!mime || !base64) return notFound();

    return new NextResponse(new Uint8Array(Buffer.from(base64, "base64")), {
      headers: {
        "Content-Type": mime,
        // A day, not forever: a prompt hidden by an admin keeps its URL, and its
        // cover should stop being served within a day.
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return notFound();
  }
}
