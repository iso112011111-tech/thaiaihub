"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";

/** Hero search. Submits to /explore so results have a shareable URL. */
export function SearchBar({
  defaultValue = "",
  placeholder = "ค้นหาสูตรสั่ง AI หรือเครื่องมือ...",
  className,
}: {
  defaultValue?: string;
  placeholder?: string;
  className?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultValue);

  return (
    <form
      role="search"
      action="/explore"
      onSubmit={(event) => {
        event.preventDefault();
        router.push(query.trim() ? `/explore?q=${encodeURIComponent(query.trim())}` : "/explore");
      }}
      className={cn(
        "flex items-center gap-2 rounded-pill bg-surface p-1.5 pl-4 shadow-[0_12px_32px_-16px_rgb(11_17_23/0.45)]",
        className,
      )}
    >
      <Search className="size-[18px] shrink-0 text-ink-muted" />
      <input
        name="q"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        aria-label="ค้นหา prompt"
        className="h-9 min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-ink-muted focus:outline-none"
      />
      <button
        type="submit"
        aria-label="ค้นหา"
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-white transition-colors hover:bg-accent-hover"
      >
        <ArrowRight className="size-4" strokeWidth={2.4} />
      </button>
    </form>
  );
}
