import "server-only";

import { adminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { safeImageSrc } from "@/lib/images/safe-src";
import { seedPrompts } from "./seed";
import type { Author, CategoryId, Prompt } from "@/types";

/**
 * Read side of the prompt library. Everything goes through Firestore via the
 * Admin SDK; when the credential is missing or the collection is still empty
 * we fall back to the seed list so the site renders during setup.
 */

/** Hidden by an admin: gone from every list, search, its own page and the AI bot. */
function isHidden(data: FirebaseFirestore.DocumentData): boolean {
  return data.status === "hidden";
}

/** Most upvoted first; views break ties. Used by the home page and /explore?sort=popular. */
function byPopularity(a: Prompt, b: Prompt): number {
  return b.upvotes - a.upvotes || b.views - a.views;
}

function toPrompt(id: string, data: FirebaseFirestore.DocumentData): Prompt {
  return {
    id,
    slug: data.slug ?? id,
    title: data.title ?? "",
    excerpt: data.excerpt ?? "",
    body: data.body ?? "",
    category: data.category ?? "other",
    tags: Array.isArray(data.tags) ? data.tags : [],
    author: {
      id: data.author?.id ?? "",
      name: data.author?.name ?? "ไม่ระบุชื่อ",
      handle: data.author?.handle ?? "",
      avatarUrl: data.author?.avatarUrl ?? undefined,
      promptCount: data.author?.promptCount ?? 0,
    },
    upvotes: data.upvotes ?? 0,
    views: data.views ?? 0,
    rating: data.rating ?? 0,
    ratingCount: data.ratingCount ?? 0,
    coverUrl: data.coverUrl ?? undefined,
    createdAt:
      typeof data.createdAt?.toDate === "function"
        ? data.createdAt.toDate().toISOString().slice(0, 10)
        : (data.createdAt ?? ""),
  };
}

/**
 * Replaces the author snapshot stored on each prompt with the live profile.
 *
 * Prompts keep a copy of the author's name and avatar from the moment they were
 * created, which is fast but goes stale the second someone edits their profile.
 * One batched read of the `users` documents fixes every prompt on the page; the
 * stored copy remains the fallback for seed rows and deleted accounts.
 */
async function withLiveAuthors(prompts: Prompt[]): Promise<Prompt[]> {
  const db = adminDb();
  if (!db || prompts.length === 0) return prompts;

  const ids = [...new Set(prompts.map((prompt) => prompt.author.id).filter(Boolean))];
  if (ids.length === 0) return prompts;

  try {
    // Read in chunks: one getAll call over thousands of references is too large a request.
    const snapshots: FirebaseFirestore.DocumentSnapshot[] = [];
    for (let start = 0; start < ids.length; start += AUTHOR_BATCH) {
      const refs = ids
        .slice(start, start + AUTHOR_BATCH)
        .map((id) => db.collection(COLLECTIONS.users).doc(id));
      snapshots.push(...(await db.getAll(...refs)));
    }

    const live = new Map<string, { name?: string; handle?: string; photoURL?: string }>();
    for (const snapshot of snapshots) {
      if (snapshot.exists) live.set(snapshot.id, snapshot.data() ?? {});
    }

    return prompts.map((prompt) => {
      const profile = live.get(prompt.author.id);
      if (!profile) return prompt;
      return {
        ...prompt,
        author: {
          ...prompt.author,
          name: profile.name ?? prompt.author.name,
          handle: profile.handle ?? prompt.author.handle,
          avatarUrl: profile.photoURL ?? prompt.author.avatarUrl,
        },
      };
    });
  } catch (error) {
    console.error("[firestore] ดึงโปรไฟล์ผู้เขียนไม่สำเร็จ ใช้ข้อมูลที่ฝังไว้แทน", error);
    return prompts;
  }
}

/** Profiles read per getAll call when hydrating authors. */
const AUTHOR_BATCH = 300;

/**
 * Fields read for the cached list. The cover (up to ~120 KB of base64 each) and
 * the author's stored avatar are left out: the list lives in server memory and
 * feeds every page, so covers are linked through /api/prompts/[id]/cover and
 * avatars come from the live profile instead.
 */
const LIST_FIELDS = [
  "slug", "title", "excerpt", "body", "category", "tags",
  "author.id", "author.name", "author.handle",
  "upvotes", "views", "rating", "ratingCount",
  "createdAt", "updatedAt", "imageCount", "status",
];

/** URL of a prompt's cover, versioned by its last change so caches refresh after an edit. */
function coverLink(id: string, data: FirebaseFirestore.DocumentData): string | undefined {
  // Every write path sets imageCount together with the cover; zero means no cover.
  if (!(Number(data.imageCount) > 0)) return undefined;
  const changed = data.updatedAt ?? data.createdAt;
  const version = typeof changed?.toMillis === "function" ? changed.toMillis() : 0;
  return `/api/prompts/${encodeURIComponent(id)}/cover?v=${version}`;
}

/** Firestore reads per round trip while walking the whole collection. */
const BATCH_SIZE = 500;
/** How long counters (views, votes, ratings) may lag behind the database. */
const CACHE_TTL_MS = 60_000;

interface PromptsCache {
  prompts: Prompt[];
  count: number;
  fetchedAt: number;
}

// Kept on globalThis because Next bundles route handlers and pages separately;
// a module-level variable would give each bundle its own copy, and an edit made
// through the API would not clear the copy the pages read.
const store = globalThis as typeof globalThis & { __promptsCache?: PromptsCache | null };

/** Call after a server-side write so the next read sees it immediately. */
export function invalidatePromptsCache() {
  store.__promptsCache = null;
}

async function fetchEveryPrompt(db: FirebaseFirestore.Firestore): Promise<Prompt[]> {
  const prompts: Prompt[] = [];
  let cursor: FirebaseFirestore.QueryDocumentSnapshot | undefined;

  for (;;) {
    let query = db
      .collection(COLLECTIONS.prompts)
      .select(...LIST_FIELDS)
      .orderBy("createdAt", "desc")
      .limit(BATCH_SIZE);
    if (cursor) query = query.startAfter(cursor);
    const snapshot = await query.get();
    // Hidden prompts are filtered here rather than in the query: a `status !=`
    // filter would force ordering by status and need a composite index.
    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (!isHidden(data)) prompts.push({ ...toPrompt(doc.id, data), coverUrl: coverLink(doc.id, data) });
    }
    if (snapshot.size < BATCH_SIZE) break;
    cursor = snapshot.docs[snapshot.docs.length - 1];
  }
  return prompts;
}

/**
 * Every prompt, newest first — no cap, so old prompts stay searchable forever.
 *
 * Reading the whole collection on every request would bill one read per prompt
 * per page view, so the list is cached. New prompts are written straight from
 * the browser and the server is never told, so each call first asks Firestore
 * for the document count (one cheap aggregate read): a new or deleted prompt
 * changes it and forces a refetch right away. Edits go through our API, which
 * calls `invalidatePromptsCache`. Only counters can be up to a minute stale.
 */
export async function getAllPrompts(): Promise<Prompt[]> {
  const db = adminDb();
  if (!db) return seedPrompts;

  try {
    const count = (await db.collection(COLLECTIONS.prompts).count().get()).data().count;
    if (count === 0) return seedPrompts;

    const cached = store.__promptsCache;
    if (cached && cached.count === count && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      return cached.prompts;
    }

    const prompts = await withLiveAuthors(await fetchEveryPrompt(db));
    store.__promptsCache = { prompts, count, fetchedAt: Date.now() };
    return prompts;
  } catch (error) {
    console.error("[firestore] อ่าน prompts ไม่สำเร็จ ใช้ข้อมูลตัวอย่างแทน", error);
    return store.__promptsCache?.prompts ?? seedPrompts;
  }
}

export async function getFeaturedPrompts(limit = 6): Promise<Prompt[]> {
  return (await getAllPrompts()).slice(0, limit);
}

export async function getPopularPrompts(limit = 4): Promise<Prompt[]> {
  const all = await getAllPrompts();
  return [...all].sort(byPopularity).slice(0, limit);
}

export async function getPromptBySlug(slug: string): Promise<Prompt | undefined> {
  const db = adminDb();
  if (db) {
    try {
      const snapshot = await db
        .collection(COLLECTIONS.prompts)
        .where("slug", "==", slug)
        .limit(10)
        .get();
      if (!snapshot.empty) {
        // Firestore cannot enforce unique slugs. If two prompts ever share one,
        // the first to exist owns the URL: createTime is set by Firestore itself,
        // so a later prompt copying the slug cannot take the page over.
        const [doc] = [...snapshot.docs].sort(
          (a, b) => a.createTime.toMillis() - b.createTime.toMillis(),
        );
        // A hidden prompt 404s; it must not fall through to a seed with the same slug.
        if (isHidden(doc.data())) return undefined;
        const [hydrated] = await withLiveAuthors([toPrompt(doc.id, doc.data())]);
        return hydrated;
      }
    } catch (error) {
      console.error("[firestore] อ่าน prompt ไม่สำเร็จ", error);
    }
  }
  return seedPrompts.find((prompt) => prompt.slug === slug);
}

export type PromptSort = "latest" | "popular";

export async function searchPrompts({
  q = "",
  category = "all",
  sort = "latest",
}: {
  q?: string;
  category?: CategoryId;
  /** `latest`: newest first (the stored order). `popular`: most upvoted, then most viewed. */
  sort?: PromptSort;
}): Promise<Prompt[]> {
  // Firestore has no substring search, so filtering happens in memory. Swap for
  // Algolia or Typesense once the library outgrows a few hundred prompts.
  const all = await getAllPrompts();
  const needle = q.trim().toLowerCase();

  const filtered = all.filter((prompt) => {
    const matchesCategory = category === "all" || prompt.category === category;
    if (!matchesCategory) return false;
    if (!needle) return true;
    return `${prompt.title} ${prompt.excerpt} ${prompt.tags.join(" ")}`
      .toLowerCase()
      .includes(needle);
  });

  // Same ordering as the home page's popular section, so the two never disagree.
  // filter() already returned a new array, so sorting it leaves the cache untouched.
  return sort === "popular" ? filtered.sort(byPopularity) : filtered;
}

/** Handles are lowercase letters, digits and underscore; seed data may also use dots or dashes. */
const HANDLE_SHAPE = /^[a-z0-9_.-]{1,40}$/;

/**
 * The public author behind /u/[handle]: name, handle and avatar only.
 *
 * No prompt count comes from the profile — that field was once writable from the
 * browser, so old documents may hold made-up numbers. Pages count real prompts.
 */
export async function getAuthorByHandle(handle: string): Promise<Author | undefined> {
  const normalized = handle.toLowerCase();
  if (!HANDLE_SHAPE.test(normalized)) return undefined;

  const db = adminDb();
  if (db) {
    try {
      const snap = await db
        .collection(COLLECTIONS.users)
        .where("handle", "==", normalized)
        .limit(1)
        .get();
      if (!snap.empty) {
        const doc = snap.docs[0];
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name ?? "ไม่ระบุชื่อ",
          handle: data.handle ?? normalized,
          avatarUrl: data.photoURL ?? undefined,
        };
      }
    } catch (error) {
      console.error("[firestore] อ่านโปรไฟล์ผู้เขียนไม่สำเร็จ", error);
    }
  }

  const all = await getAllPrompts();
  return all.find((p) => p.author.handle.toLowerCase() === normalized)?.author;
}

export async function getPromptsByAuthorId(authorId: string): Promise<Prompt[]> {
  const all = await getAllPrompts();
  return all.filter((p) => p.author.id === authorId);
}

/** Extra images live one-per-document so no single doc approaches Firestore's 1 MiB cap. */
export async function getPromptImages(promptId: string): Promise<string[]> {
  const db = adminDb();
  if (!db) return [];
  try {
    const snapshot = await db
      .collection(COLLECTIONS.prompts)
      .doc(promptId)
      .collection("images")
      .orderBy("order")
      .get();
    // Rendered as plain <img>; anything but a trusted source is dropped.
    return snapshot.docs
      .map((doc) => safeImageSrc(doc.data().dataUri as string | undefined))
      .filter((src): src is string => Boolean(src));
  } catch (error) {
    console.error("[firestore] อ่านภาพประกอบไม่สำเร็จ", error);
    return [];
  }
}
