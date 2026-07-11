import { MetadataRoute } from "next";

const SITE_URL = "https://webforge.theatom.lk";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "weekly",
      priority: 1.0,
      images: [`${SITE_URL}/Logo-WebForge.png`],
    },
    {
      url: `${SITE_URL}/#features`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/#structure`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
