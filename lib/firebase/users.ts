"use client";

import { doc, getDoc, serverTimestamp, setDoc, writeBatch } from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "./client";
import { COLLECTIONS } from "./collections";

/**
 * Every signed-in account gets a matching `users/{uid}` document — the profile
 * the app reads from, since Firebase Auth itself stores only name/email/photo.
 * Called after email sign-up and after every sign-in.
 */
export async function ensureUserProfile(
  user: User,
  extra: { username?: string; name?: string } = {},
) {
  try {
    await writeProfile(user, extra);
  } catch (error) {
    // Authentication already succeeded; a blocked profile write is worth
    // logging but must not send the user back to the login screen.
    console.error("[firestore] เขียนโปรไฟล์ไม่สำเร็จ", error);
  }
}

/** Lowercase letters, digits and underscore — the shape firestore.rules accepts. */
export function normalizeHandle(raw: string) {
  return raw.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 30);
}

/**
 * Whether a username is still free. Best effort: if the check itself fails
 * (offline, or rules published before handle reservations) it answers true, and
 * the reservation written with the profile remains the real guard.
 */
export async function isHandleAvailable(handle: string) {
  try {
    return !(await getDoc(doc(db, COLLECTIONS.handles, handle))).exists();
  } catch {
    return true;
  }
}

const SUFFIX_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

function randomSuffix() {
  return Array.from(
    crypto.getRandomValues(new Uint8Array(4)),
    (byte) => SUFFIX_ALPHABET[byte % SUFFIX_ALPHABET.length],
  ).join("");
}

async function writeProfile(
  user: User,
  extra: { username?: string; name?: string },
) {
  const ref = doc(db, COLLECTIONS.users, user.uid);
  const existing = await getDoc(ref);

  if (existing.exists()) {
    // Only fill the avatar when there is none: overwriting it here would replace
    // a photo the user uploaded on the profile page with their Google photo at
    // every sign-in.
    const update: Record<string, unknown> = { lastSeenAt: serverTimestamp() };
    if (!existing.data().photoURL && user.photoURL) update.photoURL = user.photoURL;
    await setDoc(ref, update, { merge: true });
    return;
  }

  const base = normalizeHandle(extra.username ?? user.email?.split("@")[0] ?? "");
  const firstChoice =
    base.length >= 3 ? base : `user${user.uid.slice(0, 6).toLowerCase().replace(/[^a-z0-9]/g, "0")}`;

  // The email address is deliberately not copied here; Firebase Auth already
  // holds it, and a profile document is the wrong place for account details.
  const profile = (handle: string) => ({
    uid: user.uid,
    handle,
    name: (extra.name ?? user.displayName ?? "").trim().slice(0, 60) || handle,
    photoURL: user.photoURL ?? null,
    createdAt: serverTimestamp(),
    lastSeenAt: serverTimestamp(),
  });

  // The profile and its username reservation are written in one batch, and
  // firestore.rules refuses a reservation that already exists — so two accounts
  // can never share a username. A taken name gets a random suffix and a retry.
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const handle = attempt === 0 ? firstChoice : `${firstChoice.slice(0, 25)}_${randomSuffix()}`;
    const batch = writeBatch(db);
    batch.set(ref, profile(handle));
    batch.set(doc(db, COLLECTIONS.handles, handle), { uid: user.uid });
    try {
      await batch.commit();
      return;
    } catch (error) {
      if ((error as { code?: string }).code !== "permission-denied") throw error;
    }
  }

  // Rules published before handle reservations deny the handles collection
  // outright; keep sign-up working there with a plain profile write.
  await setDoc(ref, profile(firstChoice));
}
