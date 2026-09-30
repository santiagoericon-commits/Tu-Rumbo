import type { MetadataRoute } from "next";

// background_color y theme_color repiten el token canvas (#F6F4EE): el manifest no lee CSS.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Rumbo",
    short_name: "Rumbo",
    description: "Apoyo para seguimiento de tratamiento en remisión oncológica.",
    lang: "es-MX",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#F6F4EE",
    theme_color: "#F6F4EE",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
