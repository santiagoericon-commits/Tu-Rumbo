import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Los tests corren en UTC en cualquier sistema (el servidor de producción corre en UTC).
process.env.TZ = "UTC";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
});
