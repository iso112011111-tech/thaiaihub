"use client";

import { collection, doc, getDoc, serverTimestamp, writeBatch } from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "./client";
import { COLLECTIONS } from "./collections";
import { categories } from "@/lib/constants";
import { compressToDataUri, dataUriBytes } from "@/lib/images/compress";
import { safeImageSrc } from "@/lib/images/safe-src";
import { normalizeTags, PROMPT_LIMITS } from "@/lib/prompt-limits";
import type { CategoryId } from "@/types";

const SLUG_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

/** Turns a Thai title into a URL-safe slug with a six-character random suffix. */
function slugify(title: string) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9฀-๿]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  // Exactly six characters: firestore.rules checks this shape.
  const suffix = Array.from(
    crypto.getRandomValues(new Uint8Array(6)),
    (byte) => SLUG_ALPHABET[byte % SLUG_ALPHABET.length],
  ).join("");
  return `${base || "prompt"}-${suffix}`;
}

export interface NewPrompt {
  title: string;
  category: Exclude<CategoryId, "all">;
  body: string;
  excerpt: string;
  tags: string[];
  images: File[];
}

/** Firestore's hard cap is 1 MiB per document; stay well clear of it. */
const DOC_CEILING = 700 * 1024;

/**
 * Writes the prompt to Firestore, images included.
 *
 * Images are stored as compressed WebP data URIs rather than in Storage (which
 * requires a paid plan). Only the cover lives on the prompt document so list
 * views stay light; the rest go into an `images` subcollection that only the
 * detail page reads.
 *
 * firestore.rules enforces the same limits checked below; checking here first
 * turns a bare "permission denied" into a message the user can act on.
 */
export async function createPrompt(user: User, input: NewPrompt) {
  const title = input.title.trim();
  const body = input.body.trim();
  if (!title || title.length > PROMPT_LIMITS.title) {
    throw new Error(`ชื่อ prompt ต้องยาว 1-${PROMPT_LIMITS.title} ตัวอักษร`);
  }
  if (!body || body.length > PROMPT_LIMITS.body) {
    throw new Error(`เนื้อหา prompt ต้องยาวไม่เกิน ${PROMPT_LIMITS.body.toLocaleString()} ตัวอักษร`);
  }
  if (input.images.length > PROMPT_LIMITS.images) {
    throw new Error(`แนบภาพได้สูงสุด ${PROMPT_LIMITS.images} ภาพ`);
  }
  const category = categories.some((c) => c.id !== "all" && c.id === input.category)
    ? input.category
    : "other";

  const slug = slugify(title);

  const profileSnap = await getDoc(doc(db, COLLECTIONS.users, user.uid));
  const profile = profileSnap.exists()
    ? (profileSnap.data() as { name?: string; handle?: string; photoURL?: string })
    : null;

  const [cover, ...rest] = input.images;
  const coverUri = cover
    ? await compressToDataUri(cover, {
        maxWidth: 960,
        maxHeight: 600,
        maxBytes: PROMPT_LIMITS.coverBytes,
      })
    : null;

  const galleryUris: string[] = [];
  for (const file of rest) {
    galleryUris.push(await compressToDataUri(file, { maxBytes: PROMPT_LIMITS.galleryBytes }));
  }

  const document = {
    slug,
    title,
    excerpt: (input.excerpt.trim() || body).slice(0, PROMPT_LIMITS.excerpt),
    body,
    category,
    tags: normalizeTags(input.tags),
    coverUrl: coverUri,
    imageCount: input.images.length,
    author: {
      id: user.uid,
      // Snapshot taken from the Firestore profile, not Firebase Auth — the
      // avatar the user actually picked lives there. Reads hydrate this with
      // the live profile anyway; this copy is only the fallback. Never fall back
      // to the email address: this document is public.
      name: (profile?.name ?? user.displayName ?? "ไม่ระบุชื่อ").slice(0, 60),
      handle: (profile?.handle ?? `user${user.uid.slice(0, 6).toLowerCase()}`).slice(0, 40),
      avatarUrl: safeImageSrc(profile?.photoURL ?? user.photoURL) ?? null,
    },
    upvotes: 0,
    views: 0,
    rating: 0,
    ratingCount: 0,
    // Visible at once; admins can hide it later from /admin.
    status: "published",
    createdAt: serverTimestamp(),
  };

  const estimated = new Blob([JSON.stringify(document)]).size;
  if (estimated > DOC_CEILING) {
    throw new Error(
      `ข้อมูลรวมใหญ่เกินที่ Firestore รับได้ (${Math.round(estimated / 1024)} KB) กรุณาใช้ภาพที่เล็กลง`,
    );
  }

  const promptRef = doc(collection(db, COLLECTIONS.prompts));
  const batch = writeBatch(db);
  batch.set(promptRef, document);

  // One document per extra image keeps every single doc far below the 1 MiB cap.
  galleryUris.forEach((dataUri, index) => {
    batch.set(doc(collection(promptRef, "images"), String(index)), {
      authorId: user.uid,
      order: index,
      dataUri,
      bytes: dataUriBytes(dataUri),
    });
  });

  // Prompt counts per author are derived on the server from the prompts
  // themselves, so there is no counter to bump on the profile.
  await batch.commit();

  return { id: promptRef.id, slug };
}
