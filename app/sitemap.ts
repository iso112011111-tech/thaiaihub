import type { MetadataRoute } from "next";
import { getAllPrompts } from "@/data/prompts";
import { SITE_URL } from "@/lib/constants";

export const revalidate = 3600; // Cache sitemap for 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/explore`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/tools`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  try {
    const prompts = await getAllPrompts();

    const promptRoutes: MetadataRoute.Sitemap = prompts.map((prompt) => ({
      url: `${SITE_URL}/prompt/${encodeURIComponent(prompt.slug)}`,
      lastModified: prompt.createdAt ? new Date(prompt.createdAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const authorHandles = [
      ...new Set(prompts.map((p) => p.author.handle).filter(Boolean)),
    ];

    const authorRoutes: MetadataRoute.Sitemap = authorHandles.map((handle) => ({
      url: `${SITE_URL}/u/${encodeURIComponent(handle!)}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    return [...staticRoutes, ...promptRoutes, ...authorRoutes];
  } catch (error) {
    console.error("[sitemap] Failed to generate dynamic prompt routes:", error);
    return staticRoutes;
  }
}
