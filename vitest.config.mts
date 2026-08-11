import path from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// `.mts` (not `.ts`) so Vite's native config loader treats this as ESM —
// otherwise it warns about ESM syntax in a CommonJS-loaded file.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", ".next", "e2e"],
    css: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      // Config, generated files, and route metadata are not worth covering.
      exclude: [
        "node_modules/",
        ".next/",
        "**/*.config.{ts,mts,mjs,js}",
        "**/*.d.ts",
        "src/app/**/{layout,loading,error,global-error,not-found}.tsx",
        "src/app/**/{manifest,robots,sitemap}.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
