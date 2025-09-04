import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          "argsIgnorePattern": "^_",
          "varsIgnorePattern": "^_",
          "caughtErrorsIgnorePattern": "^_"
        }
      ]
    }
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "scripts/**",
      "*.js",
      "*.mjs",
      "database/**",
      "supabase/**",
      "*.sql",
      "*.sh",
      "tsconfig.tsbuildinfo",
      "types/**",
      // Migration and utility scripts
      "api-migrate.js",
      "execute-*.js",
      "execute-*.mjs", 
      "migrate-*.js",
      "migrate-*.mjs",
      "run-*.js",
      "setup-*.js",
      "inspect-*.js",
      "*-migrate.js",
      "*-migrate.mjs",
    ],
  },
];

export default eslintConfig;
