import {
  Compass,
  Home,
  LayoutGrid,
  Trophy,
  Upload,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/** Primary navigation — rendered by both the desktop sidebar and the mobile drawer. */
export const primaryNav: NavItem[] = [
  { href: "/", label: "หน้าหลัก", icon: Home },
  { href: "/explore", label: "สำรวจ Prompt", icon: Compass },
  { href: "/tools", label: "เครื่องมือ AI", icon: LayoutGrid },
  { href: "/submit", label: "ส่ง Prompt", icon: Upload },
  { href: "/leaderboard", label: "กระดานอันดับ", icon: Trophy },
  { href: "/community", label: "ชุมชน", icon: Users },
];
