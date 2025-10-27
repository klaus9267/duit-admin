import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    proxy: {
      "/api": {
        target: "https://klaus9267.duckdns.org",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
