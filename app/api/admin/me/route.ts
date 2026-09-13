import { NextResponse } from "next/server";
import { callerIsAdmin } from "@/lib/firebase/api-helpers";

/** Whether the caller is an admin, so the UI can show admin links. Not an authorisation check. */
export async function GET(request: Request) {
  return NextResponse.json(
    { admin: await callerIsAdmin(request) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
