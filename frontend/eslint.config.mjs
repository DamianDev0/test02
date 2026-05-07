import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    plugins: { boundaries },
    settings: {
      "import/resolver": {
        typescript: { project: "./tsconfig.json" },
        node: true,
      },
      "boundaries/elements": [
        { type: "shared",   pattern: "src/shared/**/*" },
        { type: "entities", pattern: "src/entities/*/**/*",            capture: ["slice"] },
        { type: "features", pattern: "src/features/*/**/*",            capture: ["slice"] },
        { type: "widgets",  pattern: "src/widgets/*/**/*",             capture: ["slice"] },
        { type: "pages",    pattern: "src/presentation/pages/*/**/*",  capture: ["slice"] },
        { type: "app",      pattern: "src/app/**/*" },
      ],
      "boundaries/ignore": ["**/*.test.*", "**/*.spec.*"],
    },
    rules: {
      "boundaries/no-unknown": "off",
      "boundaries/no-unknown-files": "off",
      "boundaries/element-types": ["error", {
        default: "disallow",
        rules: [
          { from: "app",      allow: ["app", "pages", "widgets", "features", "entities", "shared"] },
          { from: "pages",    allow: ["pages", "widgets", "features", "entities", "shared"] },
          { from: "widgets",  allow: ["widgets", "features", "entities", "shared"] },
          { from: "features", allow: ["features", "entities", "shared"] },
          { from: "entities", allow: ["entities", "shared"] },
          { from: "shared",   allow: ["shared"] },
        ],
      }],
      "boundaries/no-private": ["error", { allowUncles: false }],
    },
  },
]);

export default eslintConfig;
