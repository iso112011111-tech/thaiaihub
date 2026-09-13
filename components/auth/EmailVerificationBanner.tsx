"use client";

import { useState } from "react";
import { sendEmailVerification } from "firebase/auth";
import { MailCheck } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { authErrorMessage } from "@/lib/firebase/errors";

/**
 * Asks email-and-password members to verify their address. Voting, rating and
 * reporting are refused until they do; Google accounts arrive verified and never
 * see this.
 */
export function EmailVerificationBanner() {
  const { user } = useAuth();
  const [verified, setVerified] = useState(false);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  if (!user || !user.email || user.emailVerified || verified) return null;

  async function resend() {
    if (!user) return;
    setBusy(true);
    setStatus("");
    try {
      await sendEmailVerification(user);
      setStatus("ส่งอีเมลแล้ว ตรวจกล่องจดหมายและโฟลเดอร์สแปม");
    } catch (error) {
      setStatus(authErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function recheck() {
    if (!user) return;
    setBusy(true);
    setStatus("");
    try {
      await user.reload();
      if (user.emailVerified) {
        // Refresh the ID token so the server sees the verified claim right away.
        await user.getIdToken(true);
        setVerified(true);
      } else {
        setStatus("ยังไม่พบการยืนยัน กดลิงก์ในอีเมลก่อน แล้วลองอีกครั้ง");
      }
    } catch (error) {
      setStatus(authErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-card border border-accent-ring bg-accent-soft px-4 py-3 text-sm text-ink-soft">
      <MailCheck className="size-4 shrink-0 text-accent-hover" />
      <span className="min-w-0 flex-1">
        ยืนยันอีเมล <strong className="font-semibold text-ink">{user.email}</strong>{" "}
        เพื่อโหวต ให้คะแนน และรายงาน prompt
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={resend}
          disabled={busy}
          className="rounded-pill border border-line bg-surface px-3 py-1 text-xs font-medium transition-colors hover:border-accent-ring disabled:opacity-60"
        >
          ส่งอีเมลอีกครั้ง
        </button>
        <button
          type="button"
          onClick={recheck}
          disabled={busy}
          className="rounded-pill bg-accent px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          ยืนยันแล้ว
        </button>
      </div>
      {status ? <p className="w-full text-xs text-ink-muted">{status}</p> : null}
    </div>
  );
}
