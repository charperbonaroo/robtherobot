import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {files: ["src/**/*.{js,mjs,cjs,ts,jsx,tsx}"]},
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    plugins: {
      "plugin:react-hooks/recommended": {
        rules: {
          'react-hooks/rules-of-hooks': 'error',
          'react-hooks/exhaustive-deps': 'warn'
        }
      }
    }
  }
];
