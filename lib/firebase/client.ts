"use client";

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

/**
 * Browser-side Firebase. Every value here ships to the client by design —
 * access control lives in firestore.rules / storage.rules, never in secrecy.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Next's fast refresh re-runs modules, so reuse the app instead of re-initialising.
export const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

/**
 * Analytics needs a browser with cookies and a measurement id, and throws in
 * SSR or unsupported environments — so it is loaded lazily and never awaited
 * by rendering code.
 */
export async function initAnalytics() {
  if (typeof window === "undefined") return null;
  if (!firebaseConfig.measurementId) return null;
  const { getAnalytics, isSupported } = await import("firebase/analytics");
  return (await isSupported()) ? getAnalytics(app) : null;
}
