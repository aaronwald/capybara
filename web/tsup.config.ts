import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    "worker/index": "worker/index.ts",
    "scripts/migrate": "scripts/migrate.ts",
  },
  outDir: "dist",
  format: ["esm"],
  platform: "node",
  target: "node22",
  clean: true,
  splitting: false,
  sourcemap: true,
  noExternal: ["drizzle-orm", "zod"],
});
