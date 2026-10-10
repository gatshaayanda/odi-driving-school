import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Odi Driving School",
    short_name: "Odi Driving",
    description: "Learn about Odi Driving School and enquire about lessons.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#F6F8F7",
    theme_color: "#163C52",
    orientation: "portrait-primary",
    lang: "en",
    categories: ["education", "lifestyle"],
    icons: [
      { src: "/icons/odi-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/odi-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }
    ]
  };
}
