import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const outDir = process.env.BUILD_TARGET === "pages" ? "docs" : "dist";

export default defineConfig({
    base: "./",
    plugins: [react()],
    build: {
        outDir,
    },
    define: {
        __BUILD_VERSION__: JSON.stringify(
            process.env.VITE_BUILD_VERSION || "dev"
        ),
    },
});
