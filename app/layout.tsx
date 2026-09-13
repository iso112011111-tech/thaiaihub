import type { Metadata } from "next";
import { Inter, Noto_Sans_Thai } from "next/font/google";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AppShell } from "@/components/layout/AppShell";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  variable: "--font-thai",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s — ${SITE_NAME}`,
  },
  description:
    "ศูนย์รวม prompt ภาษาไทยสำหรับ ChatGPT, Midjourney และเครื่องมือ AI คัดสรรโดยชุมชน",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" className={`${inter.variable} ${notoThai.variable}`}>
      <body>
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
