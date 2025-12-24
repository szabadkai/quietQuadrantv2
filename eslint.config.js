import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
    {
        ignores: [
            "dist/**",
            "node_modules/**",
            ".history/**",
            "docs/assets/**",
        ],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            globals: {
                window: "readonly",
                document: "readonly",
            },
        },
        plugins: {
            react,
            "react-hooks": reactHooks,
        },
        settings: {
            react: {
                version: "detect",
            },
        },
        rules: {
            "max-lines": [
                "error",
                { max: 300, skipBlankLines: true, skipComments: true },
            ],
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": "warn",
            indent: ["error", 4],
            "no-mixed-spaces-and-tabs": "error",
            "no-trailing-spaces": "error",
            "eol-last": ["error", "always"],
            "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 0 }],
            "space-before-blocks": ["error", "always"],
            "keyword-spacing": ["error", { before: true, after: true }],
            "space-infix-ops": "error",
            "comma-spacing": ["error", { before: false, after: true }],
            "semi-spacing": ["error", { before: false, after: true }],
            "object-curly-spacing": ["error", "always"],
            "array-bracket-spacing": ["error", "never"],
        },
    },
];
