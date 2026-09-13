import type { Metadata } from "next";
import { SubmitForm } from "@/components/prompt/SubmitForm";

export const metadata: Metadata = { title: "ส่ง Prompt" };

export default function SubmitPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <h1 className="text-xl font-bold tracking-tight text-ink">ส่ง Prompt</h1>
        <p className="mt-1 text-sm text-ink-muted">
          แชร์สูตรสั่ง AI ของคุณให้ชุมชนได้ใช้งาน ทีมงานจะตรวจสอบก่อนเผยแพร่
        </p>
      </header>

      <SubmitForm />
    </div>
  );
}
