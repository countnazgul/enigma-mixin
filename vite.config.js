/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
  test: {
    testTimeout: 60000,
    include: ["**/*.{test,spec}.?(c|m)[jt]s?(x)"],
    // exclude: ["test/playground.spec.ts"],
  },
});
