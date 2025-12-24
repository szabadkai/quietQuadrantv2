import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default [
    js.configs.recommended,
    {
        ignores: [
            "dist/**",
            "node_modules/**",
            ".history/**",
            "docs/**",
            "android/**",
            "ios/**",
            "release/**",
            "public/**",
            "electron/**",
        ],
    },
    {
        files: ["src/**/*.{js,jsx,ts,tsx}"],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                ...globals.browser,
                ...globals.es2021,
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
            ...react.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            "react/react-in-jsx-scope": "off",
            "react/prop-types": "off",
            "no-unused-vars": "warn",
            "no-empty": "warn",
            "max-lines": [
                "error",
                { max: 300, skipBlankLines: true, skipComments: true },
            ],
        },
    },
];
