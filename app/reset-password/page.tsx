import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = { title: "ลืมรหัสผ่าน" };

export default function ResetPasswordPage() {
  return (
    <div className="mx-auto max-w-md py-6">
      <header className="text-center">
        <h1 className="text-xl font-bold tracking-tight text-ink">ลืมรหัสผ่าน</h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          กรอกอีเมลที่ใช้สมัคร เราจะส่งลิงก์ตั้งรหัสผ่านใหม่ไปให้
        </p>
      </header>

      <ResetPasswordForm />

      <p className="mt-5 text-center text-sm text-ink-muted">
        <Link
          href="/login"
          className="font-medium text-accent-hover transition-colors hover:text-accent"
        >
          กลับไปหน้าเข้าสู่ระบบ
        </Link>
      </p>
    </div>
  );
}
