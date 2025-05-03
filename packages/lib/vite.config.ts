import { defineConfig } from "vite";

export const testConfig = {
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: '.setup/tests.ts',
  }
};

export default defineConfig(testConfig);