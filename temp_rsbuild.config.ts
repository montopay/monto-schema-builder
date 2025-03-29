import path from "node:path";
import { defineConfig, loadEnv } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

const { publicVars } = loadEnv({ prefixes: ["PUBLIC_", "VITE_"] });

export default defineConfig({
  plugins: [pluginReact()],
  server: {
    host: "::",
    port: 8080,
  },
  source: {
    entry: {
      index: "./src/main.tsx",
    },
    define: {
      ...publicVars,
      "import.meta.env.SSR": JSON.stringify(false),
    },
  },
  html: {
    template: "./index.html",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
