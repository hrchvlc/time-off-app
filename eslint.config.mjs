import js from "@eslint/js";
import angular from "angular-eslint";
import unusedImports from "eslint-plugin-unused-imports";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores([
    "projects/**/*",
    "src/environments/**",
    "src/app/data-access/**",
  ]),

  {
    files: ["**/*.ts"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
      plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      "@angular-eslint/component-class-suffix": ["error", {
        suffixes: ["Component", "Page", "Modal", "HarnessTest"],
      }],
      "@angular-eslint/directive-selector": ["error", {
        type: "attribute",
        prefix: "app",
        style: "camelCase",
      }],
      "@angular-eslint/component-selector": ["error", {
        type: "element",
        prefix: "app",
        style: "kebab-case",
      }],
      "@angular-eslint/no-input-rename": "off",
      "@angular-eslint/no-host-metadata-property": "off",
      curly: ["error"],
      eqeqeq: ["error"],
      "no-console": ["warn", { allow: ["error", "info", "warn"] }],
      "spaced-comment": ["warn", "always"],

      "@typescript-eslint/no-empty-object-type": ["error", {
        allowInterfaces: "with-single-extends",
      }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/prefer-enum-initializers": "error",
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/no-unused-vars": ["warn", {
        argsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      }],
      "@typescript-eslint/explicit-function-return-type": ["error", {
        allowExpressions: true,
      }],
      "@typescript-eslint/explicit-member-accessibility": ["error", {
        overrides: { constructors: "off" },
      }],
      "@typescript-eslint/member-ordering": ["warn", {
        classes: {
          memberTypes: [
            "private-static-field",
            "protected-static-field",
            "public-static-field",
            "private-readonly-field",
            "private-field",
            "protected-readonly-field",
            "protected-field",
            "public-readonly-field",
            "public-field",
            "static-initialization",
            "constructor",
            "public-static-method",
            "protected-static-method",
            "private-static-method",
            "public-instance-method",
            "protected-instance-method",
            "private-instance-method",
          ],
        },
        interfaces: {
          memberTypes: ["field", "method"],
          order: "alphabetically-case-insensitive",
        },
      }],
      "@typescript-eslint/typedef": ["warn", {
        memberVariableDeclaration: true,
        parameter: true,
        propertyDeclaration: true,
      }],
      indent: ["error", 2],
    },
  },

  {
    files: ["**/*.html"],
    extends: [
      angular.configs.templateRecommended,
      angular.configs.templateAccessibility,
    ],
    rules: {},
  },
]);
