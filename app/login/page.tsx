import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "เข้าสู่ระบบ" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md py-6">
      <header className="text-center">
        <h1 className="text-xl font-bold tracking-tight text-ink">เข้าสู่ระบบ</h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          เข้าสู่ระบบเพื่อบันทึก prompt ที่ชอบ และแบ่งปันผลงานของคุณ
        </p>
      </header>

      <LoginForm />

      <p className="mt-5 text-center text-sm text-ink-muted">
        ยังไม่มีบัญชี{" "}
        <Link
          href="/register"
          className="font-medium text-accent-hover transition-colors hover:text-accent"
        >
          สมัครสมาชิก
        </Link>
      </p>
    </div>
  );
}
