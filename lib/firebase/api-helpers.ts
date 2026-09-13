import "server-only";

import type { DecodedIdToken } from "firebase-admin/auth";
import { NextResponse } from "next/server";
import { adminAuth } from "./admin";

type Verified =
  | { token: DecodedIdToken; error?: undefined }
  | { token?: undefined; error: NextResponse };

/** Extracts and verifies the caller's Firebase ID token from the Authorization header. */
async function verifyCaller(request: Request): Promise<Verified> {
  const auth = adminAuth();
  if (!auth) {
    return {
      error: NextResponse.json({ error: "เซิร์ฟเวอร์ยังไม่ได้ตั้งค่า Firebase" }, { status: 500 }),
    };
  }

  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) {
    return { error: NextResponse.json({ error: "ต้องเข้าสู่ระบบก่อน" }, { status: 401 }) };
  }

  try {
    return { token: await auth.verifyIdToken(token) };
  } catch {
    return {
      error: NextResponse.json({ error: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" }, { status: 401 }),
    };
  }
}

export async function requireUser(request: Request) {
  const verified = await verifyCaller(request);
  if (verified.error) return { error: verified.error };
  return { uid: verified.token!.uid };
}

/** The caller's verified ID token, or null when absent or invalid — for endpoints that also serve visitors. */
export async function getCallerToken(request: Request): Promise<DecodedIdToken | null> {
  const verified = await verifyCaller(request);
  return verified.token ?? null;
}

/**
 * Like requireUser, but the account's email must be verified. Used where fake
 * accounts would skew what everyone sees — votes, ratings and reports. An
 * email-and-password account costs nothing to create with a made-up address;
 * Google accounts arrive verified.
 */
export async function requireVerifiedUser(request: Request) {
  const verified = await verifyCaller(request);
  if (verified.error) return { error: verified.error };
  if (!verified.token!.email_verified) {
    return {
      error: NextResponse.json(
        { error: "กรุณายืนยันอีเมลก่อน แล้วลองอีกครั้ง", code: "email-unverified" },
        { status: 403 },
      ),
    };
  }
  return { uid: verified.token!.uid };
}

/**
 * Admins are listed by email in ADMIN_EMAILS (comma-separated, server-only).
 * The token's email must be verified: otherwise anyone could register an
 * email-and-password account with an admin's address and pass as that admin.
 */
function isAdminToken(token: DecodedIdToken): boolean {
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  return Boolean(
    token.email && token.email_verified && admins.includes(token.email.toLowerCase()),
  );
}

export async function requireAdmin(request: Request) {
  const verified = await verifyCaller(request);
  if (verified.error) return { error: verified.error };
  if (!isAdminToken(verified.token!)) {
    return {
      error: NextResponse.json({ error: "สำหรับผู้ดูแลระบบเท่านั้น" }, { status: 403 }),
    };
  }
  return { uid: verified.token!.uid };
}

/** For showing admin links only — every admin action re-checks with requireAdmin. */
export async function callerIsAdmin(request: Request): Promise<boolean> {
  const verified = await verifyCaller(request);
  return verified.token ? isAdminToken(verified.token) : false;
}
