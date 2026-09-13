import { NextResponse } from "next/server";
import { callerIsAdmin } from "@/lib/firebase/api-helpers";

/**
 * Whether the caller is an admin, so the UI can show admin links. Not an
 * authorisation check — every admin API calls requireAdmin itself.
 *
 * Uses the same test as requireAdmin (ADMIN_EMAILS plus a verified email on the
 * ID token), so the admin menu is never shown to someone the admin APIs would
 * refuse. The token already carries the email, so no extra Firebase lookup.
 */
export async function GET(request: Request) {
  return NextResponse.json(
    { admin: await callerIsAdmin(request) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
