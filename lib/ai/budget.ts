import "server-only";

import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";

/**
 * Daily AI spend caps that hold across every server instance.
 *
 * In-memory rate limits count per process, so on a serverless host each
 * instance would allow its own share. These counters live in Firestore —
 * aiUsage/{day} for the whole site and aiUsage/{day}/users/{uid} per member —
 * and move in one transaction, so the site can never exceed the cap however it
 * scales. Each AI answer costs two small reads and two writes, far cheaper than
 * the model call they guard.
 */

const DEFAULT_SITE_DAILY_LIMIT = 500;
const DEFAULT_USER_DAILY_LIMIT = 30;

export type BudgetResult = "ok" | "user-limit" | "site-limit" | "unavailable";

function limitFromEnv(name: string, fallback: number): number {
  const value = Number.parseInt(process.env[name] ?? "", 10);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

/** The calendar day in Thailand, so the caps reset at local midnight. */
function thaiDay(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" }).format(new Date());
}

/** Reserves one AI call for `uid` today, or says which cap stops it. */
export async function takeAiBudget(uid: string): Promise<BudgetResult> {
  const db = adminDb();
  if (!db) return "unavailable";

  const siteLimit = limitFromEnv("AI_DAILY_LIMIT", DEFAULT_SITE_DAILY_LIMIT);
  const userLimit = limitFromEnv("AI_USER_DAILY_LIMIT", DEFAULT_USER_DAILY_LIMIT);
  const dayRef = db.collection(COLLECTIONS.aiUsage).doc(thaiDay());
  const userRef = dayRef.collection("users").doc(uid);

  try {
    return await db.runTransaction<BudgetResult>(async (tx) => {
      const [daySnap, userSnap] = await Promise.all([tx.get(dayRef), tx.get(userRef)]);
      if (Number(daySnap.data()?.count ?? 0) >= siteLimit) return "site-limit";
      if (Number(userSnap.data()?.count ?? 0) >= userLimit) return "user-limit";

      const bump = { count: FieldValue.increment(1), updatedAt: FieldValue.serverTimestamp() };
      tx.set(dayRef, bump, { merge: true });
      tx.set(userRef, bump, { merge: true });
      return "ok";
    });
  } catch (error) {
    // Fail closed: if the budget cannot be checked, do not spend money.
    console.error("[ai-budget] ตรวจโควตา AI ไม่สำเร็จ", error);
    return "unavailable";
  }
}
