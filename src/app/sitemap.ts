import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: site.url, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${site.url}/text`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${site.url}/files`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${site.url}/languages`, lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: `${site.url}/about`, lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: `${site.url}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${site.url}/terms`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];
}
