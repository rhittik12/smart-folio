import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules/**"],
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
    },
  },
});
