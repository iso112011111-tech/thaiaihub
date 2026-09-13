import type { Metadata } from "next";
import { ProfileForm } from "@/components/auth/ProfileForm";

export const metadata: Metadata = { title: "โปรไฟล์ของฉัน" };

export default function ProfilePage() {
  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <h1 className="text-xl font-bold tracking-tight text-ink">โปรไฟล์ของฉัน</h1>
        <p className="mt-1 text-sm text-ink-muted">
          ชื่อและรูปที่ตั้งไว้จะแสดงบน prompt ที่คุณแบ่งปันต่อจากนี้
        </p>
      </header>

      <ProfileForm />
    </div>
  );
}
