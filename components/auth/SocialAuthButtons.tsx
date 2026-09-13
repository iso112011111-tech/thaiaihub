"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { GoogleMark } from "./BrandMarks";
import { auth } from "@/lib/firebase/client";
import { ensureUserProfile } from "@/lib/firebase/users";
import { authErrorMessage } from "@/lib/firebase/errors";

/** Google is the only OAuth provider enabled for this project. */
export function SocialAuthButtons({
  verb = "เข้าสู่ระบบ",
  redirectTo = "/",
}: {
  verb?: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function signIn() {
    setBusy(true);
    setError("");
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      await ensureUserProfile(result.user);
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2.5">
      <button
        type="button"
        onClick={signIn}
        disabled={busy}
        className="flex h-11 w-full items-center justify-center gap-3 rounded-field border border-line bg-surface text-sm font-medium text-ink transition-colors hover:border-line-strong hover:bg-surface-muted disabled:opacity-60"
      >
        <GoogleMark className="size-[18px]" />
        {busy ? "กำลังเชื่อมต่อ..." : `${verb}ด้วย Google`}
      </button>

      {error ? <p className="text-[11px] text-flame">{error}</p> : null}
    </div>
  );
}
