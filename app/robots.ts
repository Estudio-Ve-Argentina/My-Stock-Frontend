import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/panel",
          "/cargar",
          "/productos",
          "/historial",
          "/categorias",
          "/mi-plan",
          "/cuenta",
          "/oauth2/",
        ],
      },
    ],
    sitemap: "https://mystock.estudiove.ar/sitemap.xml",
  };
}
