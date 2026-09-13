import "server-only";

import { adminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { getAllPrompts } from "./prompts";
import type { Author, Prompt } from "@/types";

/**
 * Contributors ranked by how many prompts they have published, then by the
 * upvotes those prompts earned.
 *
 * Counted from the prompts themselves rather than a `promptCount` field on the
 * profile: profiles are written from the browser, so a stored counter could be
 * edited to top the leaderboard.
 */
export async function getTopContributors(limit = 5): Promise<Author[]> {
  const tally = new Map<string, { author: Author; prompts: number; upvotes: number }>();

  for (const prompt of await getAllPrompts()) {
    if (!prompt.author.id) continue;
    const entry = tally.get(prompt.author.id) ?? { author: prompt.author, prompts: 0, upvotes: 0 };
    entry.prompts += 1;
    entry.upvotes += prompt.upvotes;
    tally.set(prompt.author.id, entry);
  }

  return [...tally.values()]
    .sort((a, b) => b.prompts - a.prompts || b.upvotes - a.upvotes)
    .slice(0, limit)
    .map(({ author, prompts }) => ({ ...author, promptCount: prompts }));
}

export interface AuthorProfile {
  author: Author;
  prompts: Prompt[];
  totalUpvotes: number;
}

/** Handles are lowercase letters, digits and underscore; seed data may also use dots or dashes. */
const HANDLE_SHAPE = /^[a-z0-9_.-]{1,40}$/;

/**
 * Public profile for /u/[handle]: the author and every visible prompt they have
 * published, newest first.
 *
 * Built from the cached prompt list, whose authors already carry live names and
 * avatars, so the page shows nothing those prompts do not already show publicly.
 * A member who has not published yet is found through their username
 * reservation and read with the Admin SDK — profiles are private to browsers.
 */
export async function getAuthorProfile(handle: string): Promise<AuthorProfile | undefined> {
  const normalized = handle.toLowerCase();
  if (!HANDLE_SHAPE.test(normalized)) return undefined;

  const prompts = (await getAllPrompts()).filter(
    (prompt) => prompt.author.handle.toLowerCase() === normalized,
  );
  if (prompts.length > 0) {
    return {
      author: { ...prompts[0].author, promptCount: prompts.length },
      prompts,
      totalUpvotes: prompts.reduce((sum, prompt) => sum + prompt.upvotes, 0),
    };
  }

  const db = adminDb();
  if (!db) return undefined;
  try {
    const uid = (await db.collection(COLLECTIONS.handles).doc(normalized).get()).data()?.uid;
    if (typeof uid !== "string") return undefined;
    const user = (await db.collection(COLLECTIONS.users).doc(uid).get()).data();
    if (!user) return undefined;
    return {
      author: {
        id: uid,
        name: user.name ?? normalized,
        handle: user.handle ?? normalized,
        avatarUrl: user.photoURL ?? undefined,
        promptCount: 0,
      },
      prompts: [],
      totalUpvotes: 0,
    };
  } catch (error) {
    console.error("[firestore] อ่านโปรไฟล์ผู้ใช้ไม่สำเร็จ", error);
    return undefined;
  }
}
