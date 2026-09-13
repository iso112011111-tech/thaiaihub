"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { primaryNav } from "@/lib/navigation";
import { cn } from "@/lib/utils";

/** Nav items shared by the desktop sidebar and the mobile drawer. */
export function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1" aria-label="เมนูหลัก">
      {primaryNav.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-field px-3 py-2.5 text-sm transition-colors",
              active
                ? "bg-accent-soft font-semibold text-accent-hover"
                : "font-medium text-ink-soft hover:bg-surface-muted hover:text-ink",
            )}
          >
            <Icon
              className={cn(
                "size-[18px] shrink-0 transition-colors",
                active ? "text-accent" : "text-ink-muted group-hover:text-ink-soft",
              )}
              strokeWidth={2}
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
