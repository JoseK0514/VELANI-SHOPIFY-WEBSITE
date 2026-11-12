import { defineConfig } from 'vitest/config';

// Vitest 4 no longer excludes dist by default. Run the original source suites once.
export default defineConfig({ test: { include: ['test/**/*.test.ts', 'test/**/*.test.mjs'] } });
