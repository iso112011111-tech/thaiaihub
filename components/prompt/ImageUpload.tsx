"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Plus, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_BYTES = 5 * 1024 * 1024;
const MAX_FILES = 6;

interface Item {
  id: string;
  file: File;
  url: string;
}

/**
 * Multi-image picker for the submission form: click or drop, reorder the cover,
 * remove individually. The real <input type="file" multiple> is kept in sync via
 * DataTransfer so a plain POST or a server action receives every File under `name`.
 */
export function ImageUpload({ name = "images" }: { name?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  // Blob URLs live until revoked; release whatever is left when unmounting.
  const itemsRef = useRef<Item[]>([]);
  itemsRef.current = items;
  useEffect(() => () => {
    itemsRef.current.forEach((item) => URL.revokeObjectURL(item.url));
  }, []);

  // Keep previews in step with the form's own reset button.
  useEffect(() => {
    const form = inputRef.current?.form;
    if (!form) return;
    const onReset = () => clearAll();
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  }, []);

  /** The input's FileList is the source of truth for submission — rebuild it on every change. */
  function commit(next: Item[]) {
    setItems(next);
    if (!inputRef.current) return;
    const transfer = new DataTransfer();
    next.forEach((item) => transfer.items.add(item.file));
    inputRef.current.files = transfer.files;
  }

  function clearAll() {
    items.forEach((item) => URL.revokeObjectURL(item.url));
    commit([]);
    setError("");
  }

  function add(files: FileList | null) {
    if (!files?.length) return;
    const room = MAX_FILES - items.length;
    if (room <= 0) {
      setError(`เพิ่มได้สูงสุด ${MAX_FILES} ภาพ`);
      return;
    }

    const accepted: Item[] = [];
    const problems: string[] = [];

    for (const file of Array.from(files)) {
      if (accepted.length >= room) {
        problems.push(`เพิ่มได้อีกแค่ ${room} ภาพ`);
        break;
      }
      if (!file.type.startsWith("image/")) {
        problems.push(`${file.name} ไม่ใช่ไฟล์ภาพ`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        problems.push(`${file.name} ใหญ่เกิน 5 MB`);
        continue;
      }
      accepted.push({
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        url: URL.createObjectURL(file),
      });
    }

    setError(problems[0] ?? "");
    if (accepted.length) commit([...items, ...accepted]);
  }

  function remove(id: string) {
    const target = items.find((item) => item.id === id);
    if (target) URL.revokeObjectURL(target.url);
    commit(items.filter((item) => item.id !== id));
    setError("");
  }

  /** Promote an image to first position — the first one is used as the card cover. */
  function makeCover(id: string) {
    const target = items.find((item) => item.id === id);
    if (!target) return;
    commit([target, ...items.filter((item) => item.id !== id)]);
  }

  const dropHandlers = {
    onDragOver: (event: React.DragEvent) => {
      event.preventDefault();
      setDragging(true);
    },
    onDragLeave: () => setDragging(false),
    onDrop: (event: React.DragEvent) => {
      event.preventDefault();
      setDragging(false);
      add(event.dataTransfer.files);
    },
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <label htmlFor={name} className="block text-xs font-medium text-ink-soft">
          ภาพประกอบ <span className="font-normal text-ink-muted">(ไม่บังคับ)</span>
        </label>
        <span className="text-[11px] tabular-nums text-ink-muted">
          {items.length}/{MAX_FILES}
        </span>
      </div>

      <input
        ref={inputRef}
        id={name}
        name={name}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        // Never reset `value` here: commit() has just written the merged FileList
        // onto this input, and clearing the value would wipe it before submit.
        onChange={(event) => add(event.target.files)}
      />

      {items.length === 0 ? (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
          {...dropHandlers}
          className={cn(
            "flex aspect-[16/7] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-field border border-dashed transition-colors",
            dragging
              ? "border-accent bg-accent-soft"
              : "border-line-strong bg-surface-muted hover:border-accent hover:bg-accent-soft/40",
          )}
        >
          <span className="inline-flex size-10 items-center justify-center rounded-full bg-surface">
            <ImagePlus className="size-5 text-accent" strokeWidth={2} />
          </span>
          <p className="text-sm font-medium text-ink">
            ลากไฟล์มาวาง หรือคลิกเพื่อเลือก (เลือกหลายไฟล์พร้อมกันได้)
          </p>
          <p className="text-[11px] text-ink-muted">
            แนะนำ 800 x 500 px (16:10) — JPG, PNG หรือ WebP ไม่เกิน 5 MB ต่อไฟล์
          </p>
        </div>
      ) : (
        <div
          {...dropHandlers}
          className={cn(
            "grid grid-cols-2 gap-2 rounded-field border border-dashed p-2 transition-colors sm:grid-cols-3",
            dragging ? "border-accent bg-accent-soft" : "border-transparent",
          )}
        >
          {items.map((item, index) => (
            <figure
              key={item.id}
              className="group relative overflow-hidden rounded-[10px] border border-line bg-surface-muted"
            >
              <div className="relative aspect-[16/10] w-full">
                {/* Blob URL — next/image cannot optimise it, so a plain img is correct here. */}
                <img
                  src={item.url}
                  alt={`ภาพที่ ${index + 1}`}
                  className="size-full object-cover"
                />
              </div>

              {index === 0 ? (
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-pill bg-ink/60 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                  <Star className="size-3" />
                  ภาพปก
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => makeCover(item.id)}
                  className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-pill bg-surface/90 px-2 py-0.5 text-[10px] font-medium text-ink-soft opacity-0 backdrop-blur-sm transition-opacity hover:text-accent-hover group-hover:opacity-100 focus-visible:opacity-100"
                >
                  <Star className="size-3" />
                  ตั้งเป็นปก
                </button>
              )}

              <button
                type="button"
                onClick={() => remove(item.id)}
                aria-label={`ลบภาพที่ ${index + 1}`}
                className="absolute right-2 top-2 inline-flex size-7 items-center justify-center rounded-full bg-ink/60 text-white backdrop-blur-sm transition-colors hover:bg-ink/80"
              >
                <X className="size-3.5" />
              </button>

              <figcaption className="truncate border-t border-line px-2.5 py-1.5 text-[11px] text-ink-muted">
                {item.file.name}
              </figcaption>
            </figure>
          ))}

          {items.length < MAX_FILES ? (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex aspect-[16/10] flex-col items-center justify-center gap-1.5 rounded-[10px] border border-dashed border-line-strong bg-surface-muted text-ink-muted transition-colors hover:border-accent hover:bg-accent-soft/40 hover:text-accent-hover"
            >
              <Plus className="size-5" />
              <span className="text-[11px] font-medium">เพิ่มภาพ</span>
            </button>
          ) : null}
        </div>
      )}

      {error ? <p className="text-[11px] text-flame">{error}</p> : null}
    </div>
  );
}
