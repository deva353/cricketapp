import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

   VitePWA({
  registerType: "autoUpdate",
  includeAssets: ["icons/icon.svg"],
  manifest: {
    name: "Gully Cricket",
    short_name: "Gully Cricket",
    description: "Gully cricket scoring and tournament management",
    theme_color: "#14532d",
    background_color: "#f4f7f5",
    display: "standalone",
    start_url: "/",
    scope: "/",
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  },
  workbox: {
    navigateFallback: "/index.html",
    globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
  },
})
  ],

  server: {
    port: 5173
  }
});
