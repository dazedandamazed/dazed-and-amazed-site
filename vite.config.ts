import { defineConfig } from "vite"
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { projectId, publicAnonKey } from "./utils/supabase/info"

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      "@": path.resolve(__dirname, "./src"),
    },
    // Keep hooks on one React instance when Vite discovers new UI dependencies
    // during development and rebuilds its optimized dependency graph.
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    // Pre-bundle the shared React graph up front so HMR cannot mix old and new
    // dependency-cache generations after Radix components enter the graph.
    include: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "react-router",
      "@radix-ui/react-dialog",
      "@radix-ui/react-toggle-group",
    ],
  },
  server: {
    proxy: {
      "/api/videos": {
        target: `https://${projectId}.supabase.co`,
        changeOrigin: true,
        secure: false,
        rewrite: () => "/functions/v1/make-server-095928e9/videos",
        headers: {
          Authorization: `Bearer ${publicAnonKey}`,
        },
      },
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ["**/*.svg", "**/*.csv"],
})
