"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { ImageUpload } from "./ImageUpload";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { categories } from "@/lib/constants";
import { compressToDataUri } from "@/lib/images/compress";
import { safeImageSrc } from "@/lib/images/safe-src";
import { PROMPT_LIMITS } from "@/lib/prompt-limits";
import type { CategoryId, Prompt } from "@/types";

const field = "block text-xs font-medium text-ink-soft";

export function EditPromptForm({ prompt }: { prompt: Prompt }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (loading) return <Card className="mt-6 h-96 animate-pulse bg-surface-muted" />;

  if (!user || user.uid !== prompt.author.id) {
    return (
      <Card className="mt-6 flex flex-col items-center gap-3 p-10 text-center">
        <span className="inline-flex size-10 items-center justify-center rounded-full bg-surface-muted">
          <ShieldAlert className="size-5 text-ink-muted" strokeWidth={2} />
        </span>
        <p className="text-sm font-semibold text-ink">แก้ไขได้เฉพาะเจ้าของ prompt</p>
        <Button asChild variant="outline" className="mt-1">
          <Link href={`/prompt/${prompt.slug}`}>กลับไปหน้า prompt</Link>
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
      const files = data
        .getAll("images")
        .filter((value): value is File => value instanceof File && value.size > 0);

      // Only send `images` when the user actually picked new ones — an empty
      // array would wipe the artwork that is already there.
      const payload: Record<string, unknown> = {
        title: String(data.get("title")),
        category: String(data.get("category")),
        excerpt: String(data.get("excerpt") ?? ""),
        body: String(data.get("body")),
        tags: String(data.get("tags") ?? "")
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      };

      if (files.length > 0) {
        const [cover, ...rest] = files;
        payload.images = [
          await compressToDataUri(cover, { maxWidth: 960, maxHeight: 600, maxBytes: PROMPT_LIMITS.coverBytes }),
          ...(await Promise.all(
            rest.map((file) => compressToDataUri(file, { maxBytes: PROMPT_LIMITS.galleryBytes })),
          )),
        ];
      }

      const response = await fetch(`/api/prompts/${prompt.id}`, {
        method: "PATCH",
        headers: {
          authorization: `Bearer ${await user.getIdToken()}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "บันทึกไม่สำเร็จ");

      router.push(`/prompt/${prompt.slug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
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
            defaultValue={prompt.title}
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
            defaultValue={prompt.category as CategoryId}
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
            defaultValue={prompt.excerpt}
          />
        </div>

        <div className="space-y-1.5">
          <span className={field}>ภาพประกอบ</span>
          {safeImageSrc(prompt.coverUrl) ? (
            <div className="flex items-center gap-3 rounded-field border border-line bg-surface-muted p-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element -- data URI */}
              <img
                src={safeImageSrc(prompt.coverUrl)}
                alt="ภาพปกปัจจุบัน"
                className="size-14 shrink-0 rounded-[8px] object-cover"
              />
              <p className="text-[11px] leading-relaxed text-ink-muted">
                ภาพปกปัจจุบัน — เลือกไฟล์ใหม่ด้านล่างเพื่อแทนที่ทั้งหมด
                <br />
                ถ้าไม่เลือกอะไร ภาพเดิมจะยังอยู่เหมือนเดิม
              </p>
            </div>
          ) : null}
          <ImageUpload />
        </div>

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
            defaultValue={prompt.body}
            className="w-full rounded-field border border-line bg-surface p-3.5 font-mono text-[13px] leading-relaxed text-ink focus:border-accent focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="tags" className={field}>
            แท็ก
          </label>
          <Input id="tags" name="tags" defaultValue={prompt.tags.join(", ")} />
        </div>

        {error ? <p className="text-xs text-flame">{error}</p> : null}

        <div className="flex justify-end gap-2 pt-1">
          <Button asChild variant="outline" type="button">
            <Link href={`/prompt/${prompt.slug}`}>ยกเลิก</Link>
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
