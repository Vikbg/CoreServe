// eslint.config.js
import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import pluginPrettier from "eslint-plugin-prettier";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.jest,
      },
    },
    plugins: {
      js,
      prettier: pluginPrettier,
    },
    rules: {
      ...js.configs.recommended.rules,
      "prettier/prettier": "error",
    },
    extends: [prettier],
  },
]);
