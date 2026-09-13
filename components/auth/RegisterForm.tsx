"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
import { SocialAuthButtons } from "./SocialAuthButtons";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { auth } from "@/lib/firebase/client";
import { ensureUserProfile, isHandleAvailable, normalizeHandle } from "@/lib/firebase/users";
import { authErrorMessage } from "@/lib/firebase/errors";

const field = "block text-xs font-medium text-ink-soft";

export function RegisterForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name"));
    const username = String(data.get("username"));

    setBusy(true);
    setError("");
    try {
      // Checked before the account exists, so a taken username does not leave
      // an account behind with no profile.
      if (!(await isHandleAvailable(normalizeHandle(username)))) {
        throw new Error("ชื่อผู้ใช้นี้ถูกใช้แล้ว ลองชื่ออื่น");
      }

      const credential = await createUserWithEmailAndPassword(
        auth,
        String(data.get("email")),
        String(data.get("password")),
      );
      // Auth stores the display name; Firestore stores everything else.
      await updateProfile(credential.user, { displayName: name });
      await ensureUserProfile(credential.user, { username, name });
      // Voting, rating and reporting need a verified email, so send the link now.
      await sendEmailVerification(credential.user).catch((error) => {
        console.error("[auth] ส่งอีเมลยืนยันไม่สำเร็จ", error);
      });
      router.push("/");
      router.refresh();
    } catch (err) {
      // Our own messages are plain Errors; Firebase errors carry a code to translate.
      setError(err instanceof Error && !("code" in err) ? err.message : authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="mt-6 p-6">
      <SocialAuthButtons verb="สมัคร" />

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="text-[11px] text-ink-muted">หรือใช้อีเมล</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-1.5">
          <label htmlFor="username" className={field}>
            ชื่อผู้ใช้
          </label>
          <Input
            id="username"
            name="username"
            autoComplete="username"
            placeholder="เช่น somchai_p"
            pattern="[a-zA-Z0-9_]{3,20}"
            title="ภาษาอังกฤษ ตัวเลข และขีดล่าง 3-20 ตัวอักษร"
            required
          />
          <p className="text-[11px] text-ink-muted">
            ใช้เป็นลิงก์โปรไฟล์ของคุณ เปลี่ยนภายหลังไม่ได้
          </p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className={field}>
            รหัสผ่าน
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="อย่างน้อย 8 ตัวอักษร"
            minLength={8}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="name" className={field}>
            ชื่อที่ใช้แสดง
          </label>
          <Input id="name" name="name" placeholder="ชื่อของคุณ" required />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className={field}>
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
          {busy ? "กำลังสร้างบัญชี..." : "สร้างบัญชี"}
        </Button>
      </form>
    </Card>
  );
}
