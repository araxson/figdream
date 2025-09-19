import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Extend Next.js and TypeScript recommended configs
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Global ignores
  {
    ignores: [
      // Dependencies
      "node_modules/**",
      "package-lock.json",

      // Build outputs
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",

      // Generated files
      "next-env.d.ts",
      "*.generated.*",
      "generated/**",

      // Database types (auto-generated)
      "types/database.types.ts",

      // Analysis reports
      "docs/**/*.json",
      "docs/**/*.md",
      "analyzer.ts",
      "analyzer-report.json",

      // UI library (shadcn/ui components)
      "components/ui/**",

      // Scripts (separate linting if needed)
      "scripts/**/*.ts",
      "scripts/**/*.mjs",

      // Environment and config files
      ".env*",
      "*.config.js",
      "*.config.mjs",
      "*.config.ts",

      // Cache and temp files
      ".cache/**",
      ".temp/**",
      "*.log",

      // Supabase
      "supabase/.temp/**",
      "supabase/seed.sql"
    ],
  },

  // TypeScript and TSX files - Main configuration
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      // TypeScript Strict Rules
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_"
        }
      ],
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/no-inferrable-types": "error",
      "@typescript-eslint/prefer-as-const": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          fixStyle: "inline-type-imports"
        }
      ],

      // React and Hooks Rules
      "react/prop-types": "off", // TypeScript handles prop validation
      "react/react-in-jsx-scope": "off", // Not needed in Next.js
      "react/no-unescaped-entities": "warn",
      "react/no-children-prop": "error",
      "react/jsx-no-target-blank": "error",
      "react/jsx-key": "error",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Next.js Specific Rules
      "@next/next/no-html-link-for-pages": "error",
      "@next/next/no-img-element": "error",
      "@next/next/no-sync-scripts": "error",
      "@next/next/no-head-import-in-document": "error",
      "@next/next/no-duplicate-head": "error",
      "@next/next/no-page-custom-font": "warn",

      // General JavaScript/TypeScript Quality Rules
      "no-console": [
        "error",
        {
          allow: ["warn", "error", "info"]
        }
      ],
      "no-debugger": "error",
      "no-alert": "error",
      "prefer-const": "error",
      "no-var": "error",
      "eqeqeq": ["error", "always", { null: "ignore" }],
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-return-await": "error",
      "no-throw-literal": "error",
      "prefer-promise-reject-errors": "error",
      "no-unused-expressions": [
        "error",
        {
          allowShortCircuit: true,
          allowTernary: true,
          allowTaggedTemplates: true
        }
      ],
      "no-nested-ternary": "warn",
      "no-unneeded-ternary": "error",
      "no-mixed-operators": "error",

      // Code Complexity Rules
      "complexity": ["warn", 20],
      "max-depth": ["warn", 5],
      "max-params": ["warn", 6],
      "max-lines": ["warn", 500],
      "max-lines-per-function": ["warn", 150],
      "max-statements": ["warn", 40],

      // Import Rules
      "import/no-duplicates": "error",
      "import/first": "error",
      "import/newline-after-import": "error",
      "import/no-anonymous-default-export": "warn",
      "import/no-cycle": "error",

      // Security Rules
      "no-eval": "error",
      "no-new-func": "error",
      "no-script-url": "error",

      // Async/Promise Rules
      "no-async-promise-executor": "error",
      "no-await-in-loop": "warn",
      "no-promise-executor-return": "error",
      "prefer-promise-reject-errors": "error",

      // Code Style (let Prettier handle most formatting)
      "arrow-body-style": ["warn", "as-needed"],
      "prefer-arrow-callback": "error",
      "prefer-template": "warn",
      "object-shorthand": ["error", "always"],
      "prefer-destructuring": [
        "warn",
        {
          array: false,
          object: true
        }
      ]
    }
  },

  // Server-side files (stricter rules)
  {
    files: ["**/dal/**/*.ts", "**/actions/**/*.ts", "lib/api/**/*.ts"],
    rules: {
      "no-console": "error", // No console in server code
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "no-throw-literal": "error"
    }
  },

  // Client Components (slightly relaxed)
  {
    files: ["**/*.tsx"],
    rules: {
      "@typescript-eslint/no-non-null-assertion": "warn",
      "max-lines": ["warn", 300], // Components can be up to 300 lines
      "max-lines-per-function": "off" // Components are functions
    }
  },

  // Pages (ultra-thin requirement)
  {
    files: ["app/**/page.tsx", "app/**/layout.tsx"],
    rules: {
      "max-lines": ["error", 100], // Pages must be under 100 lines
      "max-lines-per-function": ["error", 50] // Page components under 50 lines
    }
  },

  // Test files (relaxed rules)
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-non-null-assertion": "off",
      "max-lines-per-function": "off",
      "max-lines": "off",
      "no-console": "off"
    }
  },

  // Configuration files (most relaxed)
  {
    files: ["*.config.js", "*.config.mjs", "*.config.ts", "eslint.config.mjs"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-var-requires": "off",
      "no-console": "off",
      "max-lines": "off",
      "import/no-anonymous-default-export": "off"
    }
  },

  // Migration files
  {
    files: ["supabase/migrations/**/*.sql"],
    rules: {
      // SQL files don't need JS/TS rules
    }
  },

  // Scripts (utility files)
  {
    files: ["scripts/**/*.ts", "scripts/**/*.mjs"],
    rules: {
      "no-console": "off", // Scripts can use console
      "max-lines": "off",
      "max-lines-per-function": "off",
      "@typescript-eslint/no-explicit-any": "warn"
    }
  }
];

export default eslintConfig;