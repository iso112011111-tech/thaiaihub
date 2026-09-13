/**
 * Size and format limits for prompts, shared by the submit and edit forms and
 * the edit API. firestore.rules repeats the same numbers by hand, since rules
 * cannot import code — change them together.
 */
export const PROMPT_LIMITS = {
  title: 120,
  excerpt: 120,
  body: 20_000,
  tags: 10,
  tag: 30,
  /** Cover plus up to five gallery images. */
  images: 6,
  /** Encoded data-URI length, which is what Firestore stores. */
  coverBytes: 120 * 1024,
  galleryBytes: 180 * 1024,
} as const;

const IMAGE_DATA_URI = /^data:image\/(webp|png|jpeg);base64,[A-Za-z0-9+/]+={0,2}$/;

/** True only for the compressed images our own uploader produces. */
export function isImageDataUri(value: unknown, maxBytes: number): value is string {
  return typeof value === "string" && value.length <= maxBytes && IMAGE_DATA_URI.test(value);
}

/** Trimmed, de-duplicated, length-capped tags from an array or a comma-separated string. */
export function normalizeTags(raw: unknown): string[] {
  const parts = Array.isArray(raw) ? raw : typeof raw === "string" ? raw.split(",") : [];
  const tags = parts
    .map((tag) => String(tag).trim().slice(0, PROMPT_LIMITS.tag))
    .filter(Boolean);
  return [...new Set(tags)].slice(0, PROMPT_LIMITS.tags);
}
