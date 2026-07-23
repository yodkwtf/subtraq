import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SubTraq - Subscription Tracker",
    short_name: "SubTraq",
    description:
      "Track every subscription, get renewal reminders, visualize spend, and use AI to spot what to cancel.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#0B0D13",
    theme_color: "#0B0D13",
    orientation: "portrait-primary",
    categories: ["finance", "productivity", "utilities"],
    icons: [
      { src: "/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png", purpose: "any" },
    ],
  };
}
