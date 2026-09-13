"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogIn } from "lucide-react";
import { ImageUpload } from "./ImageUpload";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { categories } from "@/lib/constants";
import { createPrompt } from "@/lib/firebase/prompts.client";
import { PROMPT_LIMITS } from "@/lib/prompt-limits";
import type { CategoryId } from "@/types";

const field = "block text-xs font-medium text-ink-soft";

export function SubmitForm() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (loading) {
    return <Card className="mt-6 h-64 animate-pulse bg-surface-muted" />;
  }

  if (!user) {
    return (
      <Card className="mt-6 flex flex-col items-center gap-3 p-10 text-center">
        <span className="inline-flex size-10 items-center justify-center rounded-full bg-accent-soft">
          <LogIn className="size-5 text-accent" strokeWidth={2} />
        </span>
        <p className="text-sm font-semibold text-ink">ต้องเข้าสู่ระบบก่อนส่ง Prompt</p>
        <p className="max-w-xs text-xs leading-relaxed text-ink-muted">
          เราต้องรู้ว่าใครเป็นเจ้าของ prompt เพื่อให้เครดิตและนับคะแนนให้ถูกคน
        </p>
        <Button asChild className="mt-1">
          <Link href="/login">เข้าสู่ระบบ</Link>
        </Button>
      </Card>
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    const data = new FormData(event.currentTarget);

    setBusy(true);
    setError("");
    try {
      const { slug } = await createPrompt(user, {
        title: String(data.get("title")),
        category: String(data.get("category")) as Exclude<CategoryId, "all">,
        excerpt: String(data.get("excerpt") ?? ""),
        body: String(data.get("body")),
        tags: String(data.get("tags") ?? "")
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        images: data.getAll("images").filter((v): v is File => v instanceof File && v.size > 0),
      });
      router.push(`/prompt/${slug}`);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "บันทึกไม่สำเร็จ ตรวจสอบว่า Firestore Security Rules อนุญาตให้เขียน",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="mt-6 p-5">
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-1.5">
          <label htmlFor="title" className={field}>
            ชื่อ Prompt
          </label>
          <Input
            id="title"
            name="title"
            placeholder="เช่น เขียนอีเมลสมัครงาน"
            maxLength={PROMPT_LIMITS.title}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="category" className={field}>
            หมวดหมู่
          </label>
          <select
            id="category"
            name="category"
            className="h-11 w-full rounded-field border border-line bg-surface px-3.5 text-sm text-ink focus:border-accent focus:outline-none"
          >
            {categories
              .filter((category) => category.id !== "all")
              .map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="excerpt" className={field}>
            คำอธิบายสั้น
          </label>
          <Input
            id="excerpt"
            name="excerpt"
            maxLength={PROMPT_LIMITS.excerpt}
            placeholder="สรุปว่า prompt นี้ทำอะไร ไม่เกิน 120 ตัวอักษร"
          />
        </div>

        <ImageUpload />

        <div className="space-y-1.5">
          <label htmlFor="body" className={field}>
            เนื้อหา Prompt
          </label>
          <textarea
            id="body"
            name="body"
            rows={8}
            required
            maxLength={PROMPT_LIMITS.body}
            placeholder="วาง prompt ของคุณที่นี่ ใช้ [ตัวแปร] สำหรับส่วนที่ผู้ใช้ต้องแก้ไข"
            className="w-full rounded-field border border-line bg-surface p-3.5 font-mono text-[13px] leading-relaxed text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="tags" className={field}>
            แท็ก
          </label>
          <Input id="tags" name="tags" placeholder="คั่นด้วยจุลภาค เช่น ChatGPT, การตลาด" />
        </div>

        {error ? <p className="text-xs text-flame">{error}</p> : null}

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" type="reset" disabled={busy}>
            ล้างข้อมูล
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? "กำลังอัปโหลด..." : "ส่ง Prompt"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
