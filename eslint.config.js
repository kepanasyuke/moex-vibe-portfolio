import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";
import moex from "./tools/eslint-plugin-moex/index.js";

const STRICT_STYLE = {
  "max-statements": ["error", 2],
  "max-depth": ["error", 2],
  "no-continue": "error",
  "no-restricted-syntax": [
    "error",
    {
      selector: "BreakStatement",
      message: "break запрещён: используйте map/filter/reduce или рекурсию.",
    },
    {
      selector: "WhileStatement",
      message: "while запрещён: используйте map/filter/reduce или рекурсию.",
    },
    {
      selector: "DoWhileStatement",
      message: "do/while запрещён: используйте map/filter/reduce или рекурсию.",
    },
    {
      selector: "LabeledStatement",
      message: "Метки запрещены.",
    },
  ],
  "moex/single-exit": "error",
};

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/dist-ssr/**",
      "**/coverage/**",
      "**/playwright-report/**",
      "**/test-results/**",
      "**/.vite/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx,js,mjs}"],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: { ...globals.node, ...globals.browser },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: {
      moex,
      "react-hooks": reactHooks,
    },
    rules: {
      ...STRICT_STYLE,
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      eqeqeq: ["error", "always"],
      "prefer-const": "error",
      "no-var": "error",
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
      "no-empty": ["error", { allowEmptyCatch: true }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
  {
    files: ["tools/**", "scripts/**", "*.config.{ts,js,mjs}", "eslint.config.js"],
    rules: {
      "max-statements": "off",
      "moex/single-exit": "off",
      "no-console": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    files: ["**/hooks.{ts,tsx}"],
    rules: { "max-statements": ["error", 4] },
  },
  {
    files: ["**/*.test.ts", "**/*.spec.ts", "e2e/**"],
    rules: {
      "max-statements": "off",
      "moex/single-exit": "off",
      "max-depth": "off",
    },
  },
);
