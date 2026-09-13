import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/explore", "/prompt/", "/tools", "/leaderboard", "/u/"],
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/profile",
          "/profile/",
          "/submit",
          "/submit/",
          "/prompt/*/edit",
          "/reset-password",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
