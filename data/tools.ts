import type { AiTool } from "@/types";

export const aiTools: AiTool[] = [
  {
    id: "t1",
    name: "Claude",
    description: "ผู้ช่วยเขียนและวิเคราะห์เอกสารยาว รองรับภาษาไทยได้ดี",
    category: "แชท",
    url: "https://claude.ai",
    pricing: "freemium",
  },
  {
    id: "t2",
    name: "Midjourney",
    description: "สร้างภาพคุณภาพสูงจากคำสั่งข้อความ",
    category: "ภาพ",
    url: "https://midjourney.com",
    pricing: "paid",
  },
  {
    id: "t3",
    name: "Runway",
    description: "ตัดต่อและสร้างวิดีโอด้วย AI",
    category: "วิดีโอ",
    url: "https://runwayml.com",
    pricing: "freemium",
  },
  {
    id: "t4",
    name: "Perplexity",
    description: "ค้นหาข้อมูลพร้อมอ้างอิงแหล่งที่มา",
    category: "ค้นหา",
    url: "https://perplexity.ai",
    pricing: "freemium",
  },
];

export async function getAiTools(): Promise<AiTool[]> {
  return aiTools;
}
