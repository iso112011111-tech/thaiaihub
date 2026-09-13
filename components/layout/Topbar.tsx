"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, Search, Sparkles, X } from "lucide-react";
import { NavList } from "./NavList";
import { Button } from "@/components/ui/Button";
import { UserMenu } from "@/components/auth/UserMenu";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

/**
 * Full-width header: brand, account controls, and the mobile drawer trigger.
 * Navigation itself lives in the sidebar, so this bar stays deliberately sparse.
 */
export function Topbar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // "/" focuses search from anywhere, unless the user is already typing.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (event.key !== "/" || tag === "INPUT" || tag === "TEXTAREA") return;
      event.preventDefault();
      searchRef.current?.focus();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Escape closes the drawer; the page behind it must not scroll while it is open.
  useEffect(() => {
    if (!open) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onEscape);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line bg-surface/85 backdrop-blur-md">
      <div className="mx-auto flex h-[68px] max-w-[1440px] items-center gap-2 px-4 sm:gap-4 sm:px-6">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="เปิดเมนู"
          className="-ml-1 inline-flex size-9 items-center justify-center rounded-field text-ink-soft hover:bg-surface-muted lg:hidden"
        >
          <Menu className="size-5" />
        </button>

        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <span className="inline-flex size-9 items-center justify-center rounded-[10px] bg-ink text-[13px] font-bold tracking-tight text-white">
            AI
          </span>
          <span className="leading-tight">
            <span className="block whitespace-nowrap text-[15px] font-semibold tracking-tight text-ink">
              {SITE_NAME}
            </span>
            <span className="hidden text-[11px] text-ink-muted sm:block">
              {SITE_TAGLINE}
            </span>
          </span>
        </Link>

        <form
          role="search"
          action="/explore"
          onSubmit={(event) => {
            event.preventDefault();
            router.push(
              query.trim() ? `/explore?q=${encodeURIComponent(query.trim())}` : "/explore",
            );
          }}
          className="ml-6 hidden max-w-sm flex-1 items-center gap-2 rounded-field border border-line bg-surface-muted px-3 transition-colors focus-within:border-accent focus-within:bg-surface md:flex"
        >
          <Search className="size-4 shrink-0 text-ink-muted" />
          <input
            ref={searchRef}
            name="q"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ค้นหา prompt, เครื่องมือ หรือผู้แบ่งปัน"
            aria-label="ค้นหา"
            className="h-9 min-w-0 flex-1 bg-transparent text-[13px] text-ink placeholder:text-ink-muted focus:outline-none"
          />
          <kbd className="hidden shrink-0 rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[10px] text-ink-muted lg:block">
            /
          </kbd>
        </form>

        <div className="ml-auto flex items-center gap-1.5">
          <Link
            href="/explore"
            aria-label="ค้นหา"
            className="inline-flex size-9 items-center justify-center rounded-field text-ink-soft hover:bg-surface-muted md:hidden"
          >
            <Search className="size-[18px]" />
          </Link>
          <Button asChild size="sm" className="ml-1 hidden sm:inline-flex">
            <Link href="/submit">
              <Sparkles className="size-4" strokeWidth={2.2} />
              สร้าง Prompt
            </Link>
          </Button>
          <UserMenu />
        </div>
      </div>

      </header>

      {/* Rendered as a sibling of <header>, never inside it — `backdrop-blur` on an
          ancestor makes it the containing block for position:fixed descendants,
          which clipped this drawer to the header's own height. */}
      {open ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[272px] border-r border-line bg-surface p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-ink">เมนู</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="ปิดเมนู"
                className="inline-flex size-8 items-center justify-center rounded-field text-ink-soft hover:bg-surface-muted"
              >
                <X className="size-4" />
              </button>
            </div>
            <NavList onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
    </>
  );
}
