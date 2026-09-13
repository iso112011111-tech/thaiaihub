import "server-only";

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { cert, getApp, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

/**
 * Server-side Firebase. Reads the service account from a gitignored file, or
 * from inline env vars when deploying somewhere without a filesystem (Vercel).
 * Returns null instead of throwing so the site still renders before the key is
 * installed — callers fall back to seed data.
 */
function loadCredential() {
  const inlineKey = process.env.FIREBASE_PRIVATE_KEY;
  if (inlineKey && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PROJECT_ID) {
    return cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Env vars keep newlines escaped; the SDK needs them real.
      privateKey: inlineKey.replace(/\\n/g, "\n"),
    });
  }

  const path = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (!path) return null;
  try {
    return cert(JSON.parse(readFileSync(resolve(process.cwd(), path), "utf8")));
  } catch {
    return null;
  }
}

let cached: App | null | undefined;

export function getAdminApp(): App | null {
  if (cached !== undefined) return cached;
  if (getApps().length) return (cached = getApp());

  const credential = loadCredential();
  if (!credential) {
    console.warn(
      "[firebase-admin] ไม่พบ service account — ใช้ข้อมูลตัวอย่างแทน ดู .env.example",
    );
    return (cached = null);
  }

  cached = initializeApp({
    credential,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
  return cached;
}

export function adminDb(): Firestore | null {
  const app = getAdminApp();
  return app ? getFirestore(app) : null;
}

export function adminAuth(): Auth | null {
  const app = getAdminApp();
  return app ? getAuth(app) : null;
}

export function adminBucket() {
  const app = getAdminApp();
  return app ? getStorage(app).bucket() : null;
}

/** True once a real key is installed — used to decide between Firestore and seed data. */
export const isFirebaseAdminReady = () => getAdminApp() !== null;
