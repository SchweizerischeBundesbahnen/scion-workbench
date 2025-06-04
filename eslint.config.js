// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");
const stylistic = require("@stylistic/eslint-plugin");
const rxjs = require("@smarttools/eslint-plugin-rxjs");

module.exports = tseslint.config(
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended, // https://eslint.org/docs/latest/rules/
      tseslint.configs.strictTypeChecked, // https://typescript-eslint.io/users/configs#strict-type-checked
      {
        languageOptions: {
          parserOptions: {
            projectService: true,
          },
        },
      },
      tseslint.configs.stylisticTypeChecked,
      angular.configs.tsRecommended, // https://github.com/angular-eslint/angular-eslint/blob/main/packages/angular-eslint/src/configs/README.md
      stylistic.configs['recommended-flat'], // https://eslint.style/guide/config-presets#static-configurations
      rxjs.configs.recommended, // https://github.com/DaveMBush/eslint-plugin-rxjs?tab=readme-ov-file#rules
    ],
    processor: angular.processInlineTemplates, // https://github.com/angular-eslint/angular-eslint/blob/main/docs/CONFIGURING_FLAT_CONFIG.md#notes-on-eslint-configuration
    rules: {
      // https://typescript-eslint.io/rules/
      "@typescript-eslint/explicit-function-return-type": ["error", {
        allowExpressions: true,
      }],
      "@typescript-eslint/explicit-member-accessibility": ["error", {
        accessibility: "explicit",
        overrides: {
          constructors: "no-public",
        },
      }],
      "@typescript-eslint/member-ordering": ["error", {
        default: [
          "static-field",
          "readonly-field",
          "instance-field",
          "constructor",
          "instance-method",
          "static-method",
        ],
      }],
      "@typescript-eslint/no-empty-function": ["error", {
        allow: ["private-constructors"],
      }],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/no-unused-expressions": ["error", {
        allowShortCircuit: true,
        allowTernary: true,
      }],
      "@typescript-eslint/no-unused-vars": ["error", {
        args: "none",
      }],
      "@typescript-eslint/typedef": ["error", {
        parameter: true,
        propertyDeclaration: true,
      }],
      "@typescript-eslint/no-deprecated": "warn",
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-confusing-void-expression": ["error", {
        ignoreArrowShorthand: true,
      }],
      "@typescript-eslint/no-unnecessary-type-parameters": "off",
      "@typescript-eslint/no-redundant-type-constituents": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
      "@typescript-eslint/no-base-to-string": "off",
      "@typescript-eslint/no-extraneous-class": "off",
      "@typescript-eslint/no-invalid-void-type": "off",
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/consistent-indexed-object-style": "off",
      "@typescript-eslint/no-unnecessary-type-arguments": "off",
      "@typescript-eslint/unbound-method": "off",
      "@typescript-eslint/unified-signatures": ["error", {ignoreDifferentlyNamedParameters: true}],
      "@typescript-eslint/related-getter-setter-pairs": "off",
      "@typescript-eslint/no-unsafe-enum-comparison": "off",
      "@typescript-eslint/prefer-reduce-type-parameter": "off",

      // https://eslint.style/packages/default
      "@stylistic/indent": ["error", 2, {
        "FunctionExpression": {"parameters": "first"},
        "SwitchCase": 1,
      }],
      "@stylistic/semi": ["error", "always"],
      "@stylistic/block-spacing": ["error", "never"],
      "@stylistic/quote-props": "off",
      "@stylistic/member-delimiter-style": ["error",
        {
          "multiline": {
            "delimiter": "semi",
            "requireLast": true,
          },
          "singleline": {
            "delimiter": "semi",
            "requireLast": false,
          },
          "multilineDetection": "brackets",
        }],
      "@stylistic/object-curly-spacing": ["error", "never"],
      "@stylistic/arrow-parens": ["error", "as-needed"],
      "@stylistic/implicit-arrow-linebreak": "error",
      "@stylistic/nonblock-statement-body-position": "error",
      "@stylistic/padded-blocks": "off",
      "@stylistic/operator-linebreak": ["error", "after"],
      "@stylistic/no-floating-decimal": "off",
      "@stylistic/lines-between-class-members": "off",
      "@stylistic/multiline-ternary": "off",

      // https://github.com/angular-eslint/angular-eslint/tree/main/packages/eslint-plugin
      "@angular-eslint/no-input-rename": "off",
      "@angular-eslint/no-output-rename": "off",
      "@angular-eslint/prefer-inject": "warn",

      // https://github.com/DaveMBush/eslint-plugin-rxjs?tab=readme-ov-file#rules
      "@smarttools/rxjs/no-implicit-any-catch": "off",
    },
  },
  {
    files: ["**/*.spec.ts"],
    rules: {
      "@typescript-eslint/no-unsafe-member-access": "off",
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      // https://github.com/angular-eslint/angular-eslint/blob/main/packages/angular-eslint/src/configs/README.md
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {
      // https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin-template/README.md
      "@angular-eslint/template/label-has-associated-control": [
        "error",
        {
          "controlComponents": [
            "sci-checkbox",
            "sci-toggle-button",
          ],
        },
      ],
    },
  },
);
