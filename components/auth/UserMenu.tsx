"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bell, LogIn, LogOut, ShieldCheck, Upload, User as UserIcon } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useAuth } from "./AuthProvider";

/** Swaps the topbar's right-hand controls between signed-out and signed-in. */
export function UserMenu() {
  const { user, profile, loading, signOut } = useAuth();
  const { admin } = useIsAdmin();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  // Reserve the slot while the session is restoring so the bar does not jump.
  if (loading) return <div className="ml-1 size-8 rounded-full bg-surface-muted" />;

  if (!user) {
    return (
      <Button asChild variant="outline" size="sm" className="ml-1">
        <Link href="/login">
          <LogIn className="hidden size-4 sm:block" strokeWidth={2.2} />
          เข้าสู่ระบบ
        </Link>
      </Button>
    );
  }

  const name = profile?.name ?? user.displayName ?? user.email ?? "ผู้ใช้";
  const photo = profile?.photoURL ?? user.photoURL ?? undefined;

  return (
    <div ref={wrapRef} className="relative ml-1 flex items-center gap-1.5">
      <button
        type="button"
        aria-label="การแจ้งเตือน"
        className="relative hidden size-9 items-center justify-center rounded-field text-ink-soft hover:bg-surface-muted sm:inline-flex"
      >
        <Bell className="size-[18px]" />
      </button>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="เมนูบัญชี"
        className="rounded-full ring-offset-2 transition-shadow hover:ring-2 hover:ring-accent-ring"
      >
        <Avatar name={name} src={photo} />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-11 w-56 overflow-hidden rounded-card border border-line bg-surface shadow-[var(--shadow-card)]"
        >
          <div className="border-b border-line px-3.5 py-3">
            <p className="truncate text-sm font-semibold text-ink">{name}</p>
            {user.email ? (
              <p className="truncate text-[11px] text-ink-muted">{user.email}</p>
            ) : null}
          </div>

          <Link
            href="/submit"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-ink-soft transition-colors hover:bg-surface-muted hover:text-ink"
          >
            <Upload className="size-4" />
            ส่ง Prompt
          </Link>
          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-ink-soft transition-colors hover:bg-surface-muted hover:text-ink"
          >
            <UserIcon className="size-4" />
            โปรไฟล์ของฉัน
          </Link>
          {admin ? (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-ink-soft transition-colors hover:bg-surface-muted hover:text-ink"
            >
              <ShieldCheck className="size-4" />
              จัดการ prompt
            </Link>
          ) : null}

          <button
            type="button"
            onClick={async () => {
              setOpen(false);
              await signOut();
              router.push("/");
              router.refresh();
            }}
            className="flex w-full items-center gap-2.5 border-t border-line px-3.5 py-2.5 text-left text-sm text-ink-soft transition-colors hover:bg-surface-muted hover:text-flame"
          >
            <LogOut className="size-4" />
            ออกจากระบบ
          </button>
        </div>
      ) : null}
    </div>
  );
}
