import {
  Bot,
  Code2,
  Image as ImageIcon,
  Layers,
  Megaphone,
  MessageSquare,
  Palette,
  Sparkles,
  Video,
  type LucideIcon,
} from "lucide-react";
import type { Category, CategoryId } from "@/types";

export const SITE_NAME = "Thai AI Hub";
export const SITE_TAGLINE = "รวมสุดยอด AI ไว้ที่เดียว";

/** Filter chips under the hero search field. Order is the display order. */
export const categories: Category[] = [
  { id: "all", label: "ทั้งหมด" },
  { id: "chatgpt", label: "ChatGPT" },
  { id: "midjourney", label: "Midjourney" },
  { id: "image", label: "วาดภาพ" },
  { id: "agent", label: "สร้างตอบเอเจนต์" },
  { id: "marketing", label: "การตลาด" },
  { id: "video", label: "วิดีโอ" },
  { id: "code", label: "โค้ด/โปรแกรม" },
  { id: "other", label: "อื่นๆ" },
];

/** Icon shown in the badge pinned to each card's cover. */
export const categoryIcons: Record<Exclude<CategoryId, "all">, LucideIcon> = {
  chatgpt: MessageSquare,
  midjourney: Sparkles,
  image: Palette,
  agent: Bot,
  marketing: Megaphone,
  video: Video,
  code: Code2,
  other: ImageIcon,
};

export function categoryLabel(id: CategoryId): string {
  return categories.find((category) => category.id === id)?.label ?? id;
}

/** Placeholder cover gradients — keeps cards image-rich with zero network cost. */
export const coverGradients = [
  "from-[#0b1f3a] via-[#123a5c] to-[#07b8a2]",
  "from-[#1a1036] via-[#4c2a86] to-[#2f6bff]",
  "from-[#052b26] via-[#0a5d52] to-[#3ddcc4]",
  "from-[#2b1206] via-[#7a3312] to-[#f4753b]",
  "from-[#101418] via-[#2a3440] to-[#6b7a8c]",
  "from-[#12102b] via-[#243a7a] to-[#4fa8ff]",
];

export { Layers };
