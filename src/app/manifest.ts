import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — ${site.tagline}`,
    short_name: site.nameEn,
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#f6f4ee",
    theme_color: "#1d53d8",
    dir: "rtl",
    lang: "ar",
    categories: ["productivity", "utilities"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
