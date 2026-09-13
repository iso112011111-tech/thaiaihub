# Thai AI Hub

ศูนย์รวม prompt ภาษาไทยที่ชุมชนช่วยกันแบ่งปัน พร้อมผู้ช่วย AI THAI BOT

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Firebase (Auth + Firestore)

## เริ่มพัฒนา

```bash
npm install
cp .env.example .env.local   # ใส่ค่า Firebase, AI และ ADMIN_EMAILS
npm run dev                  # http://localhost:3000
npm run typecheck
npm run build
```

เว็บต้องต่อ Firestore จริงเสมอ ไม่มีข้อมูลตัวอย่างสำรอง ถ้าไม่ได้ตั้งค่า Firebase Admin หน้าที่อ่าน prompt จะแจ้ง error

## ขึ้นระบบจริง

ทำตาม [docs/deploy-vercel.md](docs/deploy-vercel.md): ตั้ง Environment Variables, Publish `firestore.rules`, เพิ่มโดเมนใน Firebase Auth และตั้ง Rate Limit ที่ Vercel Firewall

## ฟีเจอร์

- สำรวจ ค้นหา กรองหมวด และเรียงตามยอดนิยม (`/explore`) แบ่งหน้า 12 รายการ
- ส่ง prompt พร้อมภาพ (บีบอัดเป็น WebP เก็บใน Firestore ไม่ต้องใช้ Storage) แก้ไข และลบ
- โหวต ให้คะแนน รายงาน (ต้องยืนยันอีเมล) และนับยอดอ่าน
- โปรไฟล์สาธารณะ `/u/[handle]` และกระดานอันดับ
- AI THAI BOT: สมาชิกที่ล็อกอินคุยกับ AI ได้ภายในโควตารายวัน ผู้เยี่ยมชมได้คำตอบจากการค้นหา
- หน้าผู้ดูแล `/admin`: ซ่อน แสดง ยกเลิกรายงาน และลบ prompt

## โครงสร้างหลัก

```
app/                     หน้าและ API (App Router)
  api/chat/              AI THAI BOT
  api/prompts/[id]/      แก้ไข/ลบ, โหวต, คะแนน, ยอดอ่าน, รายงาน, ภาพปก
  api/admin/             จัดการ prompt สำหรับผู้ดูแล
components/              UI แยกตามส่วน (layout, prompt, auth, admin, home, ui)
data/                    อ่านข้อมูลฝั่งเซิร์ฟเวอร์ (prompts, contributors, tools)
lib/
  ai/                    ตัวเชื่อม AI, โควตารายวัน, ลายเซ็นประวัติแชท
  firebase/              Firebase ฝั่งเบราว์เซอร์และ Admin SDK, ตรวจสิทธิ์ API
  prompt-limits.ts       ขีดจำกัดขนาดข้อมูล (ต้องตรงกับ firestore.rules)
  rate-limit.ts          จำกัดความถี่คำขอ
firestore.rules          กฎความปลอดภัยของฐานข้อมูล
docs/deploy-vercel.md    เช็กลิสต์ขึ้นระบบ
```

## หลักความปลอดภัย

- เบราว์เซอร์เขียนได้แค่ของที่ `firestore.rules` อนุญาต ทุกอย่างที่เหลือผ่าน API ฝั่งเซิร์ฟเวอร์ ซึ่งตรวจสิทธิ์และข้อมูลเอง
- ความลับทั้งหมดอยู่ใน environment variables ห้าม commit `.env.local` หรือไฟล์ใน `secrets/`
- ขีดจำกัดใน `lib/prompt-limits.ts`, `lib/images/safe-src.ts` และ `firestore.rules` ต้องแก้ให้ตรงกันเสมอ
