import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const apiOrigin = process.env.VITE_API_ORIGIN ?? "http://localhost:5200";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: apiOrigin,
        changeOrigin: true,
        secure: false,
      },
      "/health": {
        target: apiOrigin,
        changeOrigin: true,
        secure: false,
      },
      "/alive": {
        target: apiOrigin,
        changeOrigin: true,
        secure: false,
      },
      "/signin-oidc": {
        target: apiOrigin,
        changeOrigin: true,
        secure: false,
      },
      "/signout-callback-oidc": {
        target: apiOrigin,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
  },
});
