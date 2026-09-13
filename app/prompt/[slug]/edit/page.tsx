import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EditPromptForm } from "@/components/prompt/EditPromptForm";
import { getPromptBySlug } from "@/data/prompts";

export const metadata: Metadata = { title: "แก้ไข Prompt" };

export default async function EditPromptPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const prompt = await getPromptBySlug(slug);
  if (!prompt) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <h1 className="text-xl font-bold tracking-tight text-ink">แก้ไข Prompt</h1>
        <p className="mt-1 text-sm text-ink-muted">
          ยอดอ่าน คะแนน และโหวตจะไม่ถูกรีเซ็ตเมื่อแก้ไข
        </p>
      </header>

      <EditPromptForm prompt={prompt} />
    </div>
  );
}
