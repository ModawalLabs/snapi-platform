import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  {
    rules: {
      /* --- Correctness ------------------------------------------------- */

      // `console.log` left in shipped code is noise; use `logger` instead so
      // output is structured and level-filtered.
      "no-console": ["warn", { allow: ["warn", "error"] }],

      // Unused vars are usually a half-finished refactor. `_`-prefixed args are
      // an explicit "I know, it's part of the signature".
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],

      // `any` erases the value of having types at all.
      "@typescript-eslint/no-explicit-any": "error",

      // `import type` keeps type-only imports out of the runtime bundle.
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],

      /* --- Consistency ------------------------------------------------- */

      eqeqeq: ["error", "always", { null: "ignore" }],
      "prefer-const": "error",
      "no-var": "error",
      "object-shorthand": ["warn", "always"],

      // Deep relative imports break the moment a file moves.
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../../*"],
              message: "Use the '@/' alias instead of climbing more than one level.",
            },
          ],
        },
      ],
    },
  },

  // Tests reach into internals and mock freely; the strict rules get in the way.
  {
    files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}", "vitest.setup.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off",
    },
  },

  // Must stay last: turns off stylistic rules that would fight Prettier.
  prettier,

  globalIgnores([".next/**", "out/**", "build/**", "coverage/**", "next-env.d.ts"]),
]);

export default eslintConfig;
