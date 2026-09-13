import "server-only";

import type { DocumentReference, Firestore, QueryDocumentSnapshot } from "firebase-admin/firestore";
import { COLLECTIONS } from "./collections";

/** A batch holds at most 500 writes. */
const BATCH_LIMIT = 500;

async function deleteDocs(db: Firestore, docs: QueryDocumentSnapshot[]) {
  for (let start = 0; start < docs.length; start += BATCH_LIMIT) {
    const batch = db.batch();
    docs.slice(start, start + BATCH_LIMIT).forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }
}

/**
 * Deletes a prompt and everything filed under or about it. Firestore does not
 * cascade: a deleted document leaves its subcollections, and every document
 * that points at it, behind.
 */
export async function deletePromptCascade(db: Firestore, ref: DocumentReference, id: string) {
  for (const name of ["images", "ratings"]) {
    await deleteDocs(db, (await ref.collection(name).get()).docs);
  }
  await deleteDocs(db, (await db.collection(COLLECTIONS.votes).where("promptId", "==", id).get()).docs);
  await deleteDocs(db, (await db.collection(COLLECTIONS.reports).where("promptId", "==", id).get()).docs);
  await ref.delete();
}
