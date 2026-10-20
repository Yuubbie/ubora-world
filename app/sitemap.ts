import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { SITE_URL, courseSlug } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/noun`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/signup`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  try {
    const courses = await db.course.findMany({
      where: { questionBanks: { some: { status: "approved" } } },
      select: { code: true },
      orderBy: { code: "asc" },
    });
    const courseRoutes: MetadataRoute.Sitemap = courses.map((c) => ({
      url: `${SITE_URL}/noun/${courseSlug(c.code)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
    return [...staticRoutes, ...courseRoutes];
  } catch {
    return staticRoutes;
  }
}
