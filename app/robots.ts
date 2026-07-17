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
          "/proveedores",
          "/sucursales",
          "/favoritos",
          "/informes",
          "/forgot-password",
          "/reset-password",
          "/oauth2/",
        ],
      },
    ],
    sitemap: "https://stockeo.app/sitemap.xml",
  };
}
