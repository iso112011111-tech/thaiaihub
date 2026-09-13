export type CategoryId =
  | "all"
  | "chatgpt"
  | "midjourney"
  | "image"
  | "video"
  | "audio"
  | "writing"
  | "marketing"
  | "business"
  | "education"
  | "data"
  | "language"
  | "code"
  | "agent"
  | "other";

export interface Category {
  id: CategoryId;
  label: string;
}

export interface Author {
  id: string;
  name: string;
  handle: string;
  /** Initials are rendered when no avatar image is supplied. */
  avatarUrl?: string;
  promptCount?: number;
}

export interface Prompt {
  id: string;
  slug: string;
  title: string;
  /** One-line summary shown under the title on cards. */
  excerpt: string;
  /** The full prompt text placed on the clipboard by CopyButton. */
  body: string;
  category: Exclude<CategoryId, "all">;
  tags: string[];
  author: Author;
  upvotes: number;
  views: number;
  /** 0-5 average, shown on the card next to the read count. */
  rating: number;
  /** How many people have rated — an average of one is not the same as of fifty. */
  ratingCount: number;
  /** Optional cover image; a generated gradient is used when absent. */
  coverUrl?: string;
  createdAt: string;
}

export interface AiTool {
  id: string;
  name: string;
  description: string;
  category: string;
  url: string;
  /** Square logo in /public/images/tools; initials are shown when absent. */
  logoUrl?: string;
  pricing: "free" | "freemium" | "paid";
}
