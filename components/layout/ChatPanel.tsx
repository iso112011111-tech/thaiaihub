"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { BadgeCheck, ChevronRight, SendHorizontal, X } from "lucide-react";
import type { ChatHistoryItem, ChatPromptLink, ChatResponse } from "@/app/api/chat/route";
import { cn } from "@/lib/utils";
import { SharkMark } from "./SharkMark";

interface Message {
  id: number;
  from: "bot" | "user";
  text: string;
  prompts?: ChatPromptLink[];
  exploreUrl?: string;
}

const BOT_NAME = "AI THAI BOT";

const SUGGESTIONS = ["Prompt ยอดนิยม", "Prompt วาดภาพ", "Prompt การตลาด", "Prompt เขียนโค้ด"];

/** Chat window opened by the floating launcher. Answers come from /api/chat. */
export function ChatPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const nextId = useRef(1);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [onClose]);

  // Keep the newest message in view.
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  async function ask(question: string) {
    const text = question.trim();
    if (!text || pending) return;

    // Earlier turns let the model understand follow-ups like "อันที่สองล่ะ".
    const history: ChatHistoryItem[] = messages.slice(-10).map(({ from, text }) => ({ from, text }));

    setMessages((current) => [...current, { id: nextId.current++, from: "user", text }]);
    setDraft("");
    setPending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });
      // 429 still carries a friendly reply from the server.
      if (!response.ok && response.status !== 429) throw new Error(String(response.status));
      const data = (await response.json()) as ChatResponse;
      setMessages((current) => [
        ...current,
        {
          id: nextId.current++,
          from: "bot",
          text: data.reply,
          prompts: data.prompts,
          exploreUrl: data.exploreUrl,
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        { id: nextId.current++, from: "bot", text: "ขออภัยครับ ระบบขัดข้อง ลองถามใหม่อีกครั้งนะครับ" },
      ]);
    } finally {
      setPending(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void ask(draft);
  }

  return (
    <section
      role="dialog"
      aria-label={BOT_NAME}
      className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[60] flex h-[min(600px,calc(100dvh-6.5rem))] min-h-[280px] w-[min(380px,calc(100vw-2rem))] origin-bottom-right motion-safe:animate-chat-in flex-col overflow-hidden rounded-[24px] border border-line bg-surface shadow-[0_24px_60px_-12px_rgb(11_17_23/0.28)] sm:right-8 sm:bottom-8 sm:h-[min(600px,calc(100dvh-7.5rem))]"
    >
      <header className="relative flex items-center gap-3 overflow-hidden bg-gradient-to-br from-accent to-accent-hover px-5 py-4 text-white">
        <span
          aria-hidden="true"
          className="absolute inset-0 opacity-20 [background-image:repeating-linear-gradient(45deg,rgb(255_255_255/0.5)_0_1px,transparent_1px_9px),repeating-linear-gradient(-45deg,rgb(255_255_255/0.5)_0_1px,transparent_1px_9px)]"
        />
        <span className="relative flex size-11 shrink-0 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/30">
          <SharkMark className="size-7" />
        </span>
        <div className="relative min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-base font-bold tracking-tight">
            {BOT_NAME}
            <BadgeCheck className="size-4 fill-white text-accent-hover" aria-label="บอททางการของเว็บไซต์" />
          </p>
          <p className="truncate text-xs text-white/85">ถามเรื่อง Prompt ในเว็บได้เลย</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="ปิดแชท"
          className="relative inline-flex size-9 items-center justify-center rounded-full hover:bg-white/15"
        >
          <X className="size-5" />
        </button>
      </header>

      <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto bg-surface-muted px-4 py-5">
        <BotRow>
          <p>
            สวัสดีครับ! ผม <strong className="font-semibold text-accent-hover">{BOT_NAME}</strong>{" "}
            ถามเรื่อง Prompt ในเว็บไซต์เราได้เลยครับ
          </p>
        </BotRow>

        {messages.length === 0 && (
          <div className="flex flex-wrap gap-2 pl-11">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => void ask(suggestion)}
                className="rounded-pill border border-line bg-surface px-3.5 py-1.5 text-xs text-ink-soft transition-colors hover:border-accent-ring hover:bg-accent-soft hover:text-accent-hover"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {messages.map((message) =>
          message.from === "user" ? (
            <div key={message.id} className="flex justify-end">
              <p className="max-w-[80%] rounded-[18px] rounded-br-md bg-accent px-4 py-2.5 text-sm text-white">
                {message.text}
              </p>
            </div>
          ) : (
            <BotRow key={message.id}>
              <p className="whitespace-pre-line">{message.text}</p>
              {message.prompts && message.prompts.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {message.prompts.map((prompt) => (
                    <li key={prompt.slug}>
                      <Link
                        href={`/prompt/${prompt.slug}`}
                        onClick={onClose}
                        className="group flex items-center gap-2 rounded-xl border border-line bg-surface-muted px-3 py-2 transition-colors hover:border-accent-ring hover:bg-accent-soft"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-medium text-ink">{prompt.title}</span>
                          <span className="block truncate text-[11px] text-ink-muted">{prompt.category}</span>
                        </span>
                        <ChevronRight className="size-4 shrink-0 text-ink-muted group-hover:text-accent-hover" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {message.exploreUrl && (
                <Link
                  href={message.exploreUrl}
                  onClick={onClose}
                  className="mt-2 inline-block text-xs font-medium text-accent-hover hover:underline"
                >
                  ดูผลการค้นหาทั้งหมด →
                </Link>
              )}
            </BotRow>
          ),
        )}

        {pending && (
          <BotRow>
            <span className="flex gap-1 py-1" aria-label="กำลังพิมพ์">
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  className="size-1.5 animate-bounce rounded-full bg-accent"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </span>
          </BotRow>
        )}
      </div>

      <form onSubmit={onSubmit} className="border-t border-line bg-surface px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="ถามเรื่อง Prompt..."
            maxLength={500}
            className="h-11 min-w-0 flex-1 rounded-field border border-line bg-surface-muted px-4 text-sm text-ink outline-none placeholder:text-ink-muted focus:border-accent focus:ring-2 focus:ring-accent-ring"
          />
          <button
            type="submit"
            aria-label="ส่ง"
            disabled={!draft.trim() || pending}
            className={cn(
              "inline-flex size-11 shrink-0 items-center justify-center rounded-field transition-colors",
              draft.trim() && !pending
                ? "bg-accent text-white hover:bg-accent-hover"
                : "bg-surface-muted text-ink-muted",
            )}
          >
            <SendHorizontal className="size-5" />
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] leading-relaxed text-ink-muted">
          บอทนี้เป็นผู้ช่วยค้นหา Prompt เบื้องต้นเท่านั้น หากคำตอบคลาดเคลื่อน
          ให้ยึดตามข้อมูลบน<span className="font-semibold text-ink-soft">หน้า Prompt ในเว็บไซต์</span>เป็นหลัก
        </p>
      </form>
    </section>
  );
}

function BotRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-hover">
        <SharkMark className="size-5" />
      </span>
      <div className="max-w-[85%] rounded-[18px] rounded-tl-md border border-line bg-surface px-4 py-3 text-sm leading-relaxed text-ink">
        {children}
      </div>
    </div>
  );
}
