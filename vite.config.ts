import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  // Ensure assets and SPA work under a subpath (/funnels/<slug>)
  const rawBase = process.env.VITE_APP_BASEPATH || "/";
  const base = rawBase.endsWith("/") ? rawBase : `${rawBase}/`;

  return {
    base,
    server: {
      host: "::",
      port: 5174,
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
