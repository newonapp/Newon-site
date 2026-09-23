import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === "production" ? "/nawon/" : "/",
  build: {
    outDir: "../nawon",
    emptyOutDir: true,
  },
  server: { port: 5174, strictPort: true },
});
