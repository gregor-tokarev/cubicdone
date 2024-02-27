import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import * as path from "path";
import createSVGSpritePlugin from "vite-plugin-svg-spriter";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    createSVGSpritePlugin({
      svgFolder: "./src/assets/svg",
      transformIndexHtmlTag: {
        injectTo: "body",
      },
    }),
    // VitePWA({
    //   registerType: "autoUpdate",
    //   injectRegister: "auto",
    //   workbox: { globPatterns: ["**/*.{js,css,html,ico,png,svg}"] },
    // }),
  ],
  resolve: {
    alias: [
      {
        find: "@components",
        replacement: path.resolve(__dirname, "./src/components"),
      },
      { find: "@store", replacement: path.resolve(__dirname, "./src/store") },
      { find: "@models", replacement: path.resolve(__dirname, "./src/models") },
      { find: "@utils", replacement: path.resolve(__dirname, "./src/utils") },
      { find: "@assets", replacement: path.resolve(__dirname, "./src/assets") },
    ],
  },
});
