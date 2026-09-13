import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = { title: "สมัครสมาชิก" };

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md py-6">
      <header className="text-center">
        <h1 className="text-xl font-bold tracking-tight text-ink">สมัครสมาชิก</h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          สร้างบัญชีเพื่อเริ่มแบ่งปัน prompt ของคุณให้ชุมชน
        </p>
      </header>

      <RegisterForm />

      <p className="mt-5 text-center text-sm text-ink-muted">
        มีบัญชีอยู่แล้ว{" "}
        <Link
          href="/login"
          className="font-medium text-accent-hover transition-colors hover:text-accent"
        >
          เข้าสู่ระบบ
        </Link>
      </p>
    </div>
  );
}
