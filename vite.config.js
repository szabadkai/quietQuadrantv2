import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    base: "./",
    plugins: [react()],
    build: {
        outDir: "dist",
    },
    define: {
        __BUILD_VERSION__: JSON.stringify(
            process.env.VITE_BUILD_VERSION || "dev"
        ),
    },
});
