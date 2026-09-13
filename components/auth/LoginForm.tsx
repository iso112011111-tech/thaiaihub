"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { SocialAuthButtons } from "./SocialAuthButtons";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { auth } from "@/lib/firebase/client";
import { ensureUserProfile } from "@/lib/firebase/users";
import { authErrorMessage } from "@/lib/firebase/errors";

export function LoginForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        String(data.get("email")),
        String(data.get("password")),
      );
      await ensureUserProfile(credential.user);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="mt-6 p-6">
      <SocialAuthButtons />

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="text-[11px] text-ink-muted">หรือใช้อีเมล</span>
        <span className="h-px flex-1 bg-line" />
      </div>

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

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-xs font-medium text-ink-soft">
              รหัสผ่าน
            </label>
            <Link
              href="/reset-password"
              className="text-xs text-ink-muted transition-colors hover:text-accent-hover"
            >
              ลืมรหัสผ่าน
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="รหัสผ่านของคุณ"
            required
          />
        </div>

        {error ? <p className="text-xs text-flame">{error}</p> : null}

        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </Button>
      </form>
    </Card>
  );
}
