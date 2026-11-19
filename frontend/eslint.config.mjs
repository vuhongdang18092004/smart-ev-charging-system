import { relative, sep } from "node:path";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"],
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  {
    files: ["src/**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}"],
    plugins: {
      project: {
        rules: {
          "kebab-case": {
            meta: {
              messages: { invalid: 'Use kebab-case for "{{name}}".' },
            },
            create(context) {
              return {
                Program(node) {
                  const segments = relative(
                    context.cwd,
                    context.filename,
                  ).split(sep);
                  const file = segments
                    .pop()
                    .replace(/\.(?:[cm]?[jt]s|[jt]sx)$/, "");
                  const inApp = segments[1] === "app";
                  const kebab = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
                  const routeName = (segment) =>
                    segment
                      .replace(/^\[\[\.\.\.(.+)\]\]$/, "$1")
                      .replace(/^\[(?:\.\.\.)?(.+)\]$/, "$1")
                      .replace(/^\(([^.][^()]*)\)$/, "$1")
                      .replace(
                        /^(?:_|@|\(\.\)|\(\.\.\)(?:\(\.\.\))?|\(\.\.\.\))/,
                        "",
                      );
                  const invalid = segments.find(
                    (segment) =>
                      !kebab.test(inApp ? routeName(segment) : segment),
                  );
                  if (invalid || !kebab.test(file.replace(/\.d$/, ""))) {
                    context.report({
                      node,
                      messageId: "invalid",
                      data: { name: invalid ?? file },
                    });
                  }
                },
              };
            },
          },
        },
      },
    },
    rules: { "project/kebab-case": "error" },
  },
  {
    files: ["src/components/base/**/*.{js,jsx,ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            "@/components/features/**",
            "@/services/**",
            "**/features/**",
            "**/services/**",
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
