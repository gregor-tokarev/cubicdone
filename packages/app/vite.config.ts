import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import * as path from "path";
import createSVGSpritePlugin from "vite-plugin-svg-spriter";
import { VitePWA } from "vite-plugin-pwa";

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
        VitePWA({
            registerType: "autoUpdate",
            injectRegister: "auto",
            workbox: { globPatterns: ["**/*.{js,css,html,ico,png,svg}"] },
        }),
        sentryVitePlugin({
            org: "me-sgp",
            project: "cubicdone",
        }),
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

    build: {
        target: "esnext",
        sourcemap: true,
    },

    server: {
        port: 3000,
        host: true,
    },
    preview: {
        port: 3000,
        host: true,
    },
});
