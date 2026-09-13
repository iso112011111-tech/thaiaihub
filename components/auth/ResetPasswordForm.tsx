"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { auth } from "@/lib/firebase/client";
import { authErrorMessage } from "@/lib/firebase/errors";

export function ResetPasswordForm() {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email"));
    setBusy(true);
    setError("");
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <Card className="mt-6 p-6 text-center">
        <p className="text-sm font-semibold text-ink">ส่งอีเมลแล้ว</p>
        <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">
          ตรวจกล่องจดหมายของคุณ ถ้าไม่พบให้ดูในโฟลเดอร์สแปม
        </p>
      </Card>
    );
  }

  return (
    <Card className="mt-6 p-6">
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-xs font-medium text-ink-soft">
            อีเมล
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </div>

        {error ? <p className="text-xs text-flame">{error}</p> : null}

        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? "กำลังส่ง..." : "ส่งลิงก์ตั้งรหัสผ่านใหม่"}
        </Button>
      </form>
    </Card>
  );
}
