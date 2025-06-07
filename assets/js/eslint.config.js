import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
export default defineConfig([
    { files: ["**/*.ts"], plugins: { js }, extends: ["js/recommended"] },
    { files: ["**/*.ts"], languageOptions: { globals: globals.browser } },
    tseslint.configs.recommended,
]);
