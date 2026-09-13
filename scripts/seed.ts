/**
 * Pushes the seed prompts into Firestore so a fresh project has content.
 * Run with:  npm run seed
 * Safe to re-run — documents are keyed by slug, so it upserts rather than duplicates.
 */
import { readFileSync } from "node:fs";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { seedPrompts } from "../data/seed.ts";

const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH ?? "./secrets/firebase-admin.json";
const serviceAccount = JSON.parse(readFileSync(keyPath, "utf8"));

const app = initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(app);

const prompts = db.collection("prompts");
const users = db.collection("users");

let written = 0;
const authors = new Map<string, { name: string; handle: string; promptCount: number }>();

for (const prompt of seedPrompts) {
  await prompts.doc(prompt.slug).set(
    {
      ...prompt,
      coverUrl: prompt.coverUrl ?? null,
      imageCount: 0,
      status: "published",
      createdAt: new Date(prompt.createdAt),
    },
    { merge: true },
  );
  written += 1;

  authors.set(prompt.author.id, {
    name: prompt.author.name,
    handle: prompt.author.handle,
    promptCount: prompt.author.promptCount ?? 0,
  });
}

for (const [id, author] of authors) {
  await users.doc(id).set({ uid: id, ...author, photoURL: null }, { merge: true });
}

console.log(`เขียน prompts ${written} รายการ และผู้ใช้ ${authors.size} คน เรียบร้อย`);
process.exit(0);
