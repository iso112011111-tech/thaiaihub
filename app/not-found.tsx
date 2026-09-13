import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-muted">
        404
      </p>
      <h1 className="mt-3 text-xl font-bold tracking-tight text-ink">
        ไม่พบหน้าที่คุณค้นหา
      </h1>
      <p className="mt-2 max-w-sm text-sm text-ink-muted">
        หน้านี้อาจถูกย้ายหรือลบไปแล้ว ลองกลับไปที่หน้าหลักเพื่อค้นหา prompt อื่น
      </p>
      <Button asChild className="mt-5">
        <Link href="/">กลับหน้าหลัก</Link>
      </Button>
    </div>
  );
}
