import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      workbox: { globPatterns: ["**/*.{js,css,html,ico,png,svg}"] },
    }),
  ],
  resolve: {
    alias: {
      "@components": "src/components",
      "@store": "src/store",
      "@models": "src/models",
      "@utils": "src/utils",
      "@assets": "src/assets",
    },
  },
});
