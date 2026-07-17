import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL(".", import.meta.url));
const config = {
  root,
  resolve: { alias: { "@": root } },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    exclude: ["node_modules/**", ".next/**", "e2e/**"],
  },
};
export default config;
