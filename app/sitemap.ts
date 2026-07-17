import type { MetadataRoute } from "next";

const BASE_URL = "https://stockeo.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE_URL, lastModified: "2025-07-17", changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/planes`, lastModified: "2025-07-17", changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/faq`, lastModified: "2025-07-17", changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/contacto`, lastModified: "2025-07-17", changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/login`, lastModified: "2025-07-17", changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/signup`, lastModified: "2025-07-17", changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/terms`, lastModified: "2025-07-17", changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/privacy`, lastModified: "2025-07-17", changeFrequency: "yearly", priority: 0.2 },
  ];
}
