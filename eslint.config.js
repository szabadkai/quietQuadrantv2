import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  {
    ignores: ["dist/**", "node_modules/**"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly"
      }
    },
    plugins: {
      react,
      "react-hooks": reactHooks
    },
    settings: {
      react: {
        version: "detect"
      }
    },
    rules: {
      "max-lines": [
        "error",
        { max: 300, skipBlankLines: true, skipComments: true }
      ],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn"
    }
  }
];
