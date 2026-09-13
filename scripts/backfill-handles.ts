/**
 * Reserves the username of every existing profile in handles/{handle}, so new
 * sign-ups cannot take a name already in use. Profiles created before
 * reservations existed have none.
 *
 * Run once after publishing firestore.rules:  npm run backfill:handles
 * Safe to re-run — it only creates missing reservations, and lists any username
 * that two existing accounts already share so it can be fixed by hand.
 */
import { readFileSync } from "node:fs";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH ?? "./secrets/firebase-admin.json";
const db = getFirestore(initializeApp({ credential: cert(JSON.parse(readFileSync(keyPath, "utf8"))) }));

let reserved = 0;
let alreadyReserved = 0;
const conflicts: string[] = [];

for (const user of (await db.collection("users").get()).docs) {
  const handle = user.data().handle;
  if (typeof handle !== "string" || handle.length === 0) continue;

  const ref = db.collection("handles").doc(handle);
  const owner = await db.runTransaction(async (tx) => {
    const snapshot = await tx.get(ref);
    if (snapshot.exists) return String(snapshot.data()?.uid ?? "");
    tx.create(ref, { uid: user.id });
    return null;
  });

  if (owner === null) reserved += 1;
  else if (owner === user.id) alreadyReserved += 1;
  else conflicts.push(`@${handle}: ใช้ร่วมกันโดย ${owner} และ ${user.id}`);
}

console.log(`จองชื่อใหม่ ${reserved} ชื่อ, จองไว้แล้ว ${alreadyReserved} ชื่อ`);
if (conflicts.length) {
  console.log(`ชื่อซ้ำที่ต้องแก้เอง ${conflicts.length} รายการ:\n${conflicts.join("\n")}`);
}
process.exit(0);
