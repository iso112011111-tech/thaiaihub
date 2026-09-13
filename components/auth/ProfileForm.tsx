"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { updateProfile } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { Camera, Check, LogIn, Trash2 } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { db } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { authErrorMessage } from "@/lib/firebase/errors";
import { compressToDataUri } from "@/lib/images/compress";

/** Avatars are stored inline in Firestore, so they must stay small. */
const AVATAR_BUDGET = 60 * 1024;

export function ProfileForm() {
  const { user, profile, loading } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Seed the form once the profile arrives, without clobbering in-progress edits.
  useEffect(() => {
    if (!profile) return;
    setName((current) => (current === "" ? profile.name : current));
    setPhoto((current) => (current === null ? profile.photoURL : current));
  }, [profile]);

  if (loading) return <Card className="mt-6 h-72 animate-pulse bg-surface-muted" />;

  if (!user) {
    return (
      <Card className="mt-6 flex flex-col items-center gap-3 p-10 text-center">
        <span className="inline-flex size-10 items-center justify-center rounded-full bg-accent-soft">
          <LogIn className="size-5 text-accent" strokeWidth={2} />
        </span>
        <p className="text-sm font-semibold text-ink">ต้องเข้าสู่ระบบก่อนดูโปรไฟล์</p>
        <Button asChild className="mt-1">
          <Link href="/login">เข้าสู่ระบบ</Link>
        </Button>
      </Card>
    );
  }

  async function pickPhoto(file: File | undefined) {
    if (!file) return;
    setError("");
    try {
      setPhoto(
        await compressToDataUri(file, {
          maxWidth: 256,
          maxHeight: 256,
          maxBytes: AVATAR_BUDGET,
        }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "อ่านไฟล์ภาพไม่สำเร็จ");
    }
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;

    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError("ชื่อที่แสดงต้องมีอย่างน้อย 2 ตัวอักษร");
      return;
    }

    setBusy(true);
    setError("");
    setSaved(false);
    try {
      await updateDoc(doc(db, COLLECTIONS.users, user.uid), {
        name: trimmed,
        photoURL: photo,
      });
      // Firebase Auth's photoURL caps out well below a data URI, so only the
      // display name is mirrored there; Firestore stays the source of truth.
      await updateProfile(user, { displayName: trimmed });
      setSaved(true);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="mt-6 p-6">
      <form className="space-y-5" onSubmit={save}>
        <div className="flex items-center gap-5">
          <Avatar name={name || "ผู้ใช้"} src={photo ?? undefined} size="xl" />

          <div className="space-y-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(event) => pickPhoto(event.target.files?.[0])}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileRef.current?.click()}
              >
                <Camera className="size-4" />
                เปลี่ยนรูป
              </Button>
              {photo ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPhoto(null);
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                >
                  <Trash2 className="size-4" />
                  ลบรูป
                </Button>
              ) : null}
            </div>
            <p className="text-[11px] text-ink-muted">
              ระบบจะย่อเป็น 256 x 256 ให้อัตโนมัติ รองรับ JPG, PNG, WebP
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="name" className="block text-xs font-medium text-ink-soft">
            ชื่อที่ใช้แสดง
          </label>
          <Input
            id="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={40}
            placeholder="ชื่อของคุณ"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <span className="block text-xs font-medium text-ink-soft">ชื่อผู้ใช้</span>
            <div className="flex h-11 items-center rounded-field border border-line bg-surface-muted px-3.5 text-sm text-ink-muted">
              @{profile?.handle || "—"}
            </div>
            <p className="text-[11px] text-ink-muted">เปลี่ยนไม่ได้</p>
          </div>

          <div className="space-y-1.5">
            <span className="block text-xs font-medium text-ink-soft">อีเมล</span>
            <div className="flex h-11 items-center truncate rounded-field border border-line bg-surface-muted px-3.5 text-sm text-ink-muted">
              {user.email ?? "—"}
            </div>
            <p className="text-[11px] text-ink-muted">มาจากบัญชีที่ใช้เข้าสู่ระบบ</p>
          </div>
        </div>

        {error ? <p className="text-xs text-flame">{error}</p> : null}

        <div className="flex items-center justify-end gap-3 border-t border-line pt-4">
          {saved ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-accent-hover">
              <Check className="size-4" />
              บันทึกแล้ว
            </span>
          ) : null}
          <Button type="submit" disabled={busy}>
            {busy ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
